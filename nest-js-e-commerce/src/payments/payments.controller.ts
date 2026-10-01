import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PaymentsService } from "./payments.service";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /payments/create-intent
  @Post("create-intent")
  @UseGuards(JwtAuthGuard)
  createIntent(@Req() req, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createPaymentIntent(req.user.id, dto.orderId);
  }

  // POST /payments/webhook
  // Stripe calls this directly, so it is unauthenticated and verified via signature instead.
  @Post("webhook")
  async handleWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException("Missing Stripe signature header");
    }

    const event = this.paymentsService.constructWebhookEvent(
      req["rawBody"],
      signature,
    );

    await this.paymentsService.handleWebhookEvent(event);

    return { received: true };
  }
}
