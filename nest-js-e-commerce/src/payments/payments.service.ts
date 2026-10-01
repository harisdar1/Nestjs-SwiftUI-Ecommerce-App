import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Stripe from "stripe";
import { Order } from "../orders/entities/order.entity";

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    this.stripe = new Stripe(this.config.get<string>("STRIPE_SECRET_KEY", ""));
  }

  async createPaymentIntent(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.status !== "pending") {
      throw new BadRequestException(
        `Order is already ${order.status}, cannot start a new payment`,
      );
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    });

    order.paymentIntentId = paymentIntent.id;
    await this.orderRepo.save(order);

    return { clientSecret: paymentIntent.client_secret };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET", "");
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.markOrderPaid(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await this.markOrderPaymentFailed(event.data.object);
        break;
    }
  }

  private async markOrderPaid(paymentIntent: Stripe.PaymentIntent) {
    const order = await this.orderRepo.findOne({
      where: { paymentIntentId: paymentIntent.id },
    });
    if (!order) return;

    order.status = "paid";
    await this.orderRepo.save(order);
  }

  private async markOrderPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const order = await this.orderRepo.findOne({
      where: { paymentIntentId: paymentIntent.id },
    });
    if (!order) return;

    order.status = "payment_failed";
    await this.orderRepo.save(order);
  }
}
