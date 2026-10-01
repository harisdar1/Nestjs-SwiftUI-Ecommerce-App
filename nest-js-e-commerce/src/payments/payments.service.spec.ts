import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Order } from "../orders/entities/order.entity";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let orderRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn(),
      save: jest.fn((order) => Promise.resolve(order)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue("sk_test_fake") },
        },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    // Stub the Stripe SDK call so no real network request is made.
    (service as any).stripe.paymentIntents = {
      create: jest.fn().mockResolvedValue({
        id: "pi_123",
        client_secret: "pi_123_secret_abc",
      }),
    };
  });

  it("creates a payment intent for a pending order and stores its id", async () => {
    orderRepo.findOne.mockResolvedValue({
      id: "order-1",
      total: "49.99",
      status: "pending",
    });

    const result = await service.createPaymentIntent("user-1", "order-1");

    expect(result).toEqual({ clientSecret: "pi_123_secret_abc" });
    expect((service as any).stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 4999, currency: "usd" }),
    );
    expect(orderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentIntentId: "pi_123" }),
    );
  });

  it("throws if the order does not belong to the user / does not exist", async () => {
    orderRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createPaymentIntent("user-1", "order-404"),
    ).rejects.toThrow(NotFoundException);
  });

  it("refuses to start a new payment for an order that already has one", async () => {
    orderRepo.findOne.mockResolvedValue({
      id: "order-1",
      total: "49.99",
      status: "paid",
    });

    await expect(
      service.createPaymentIntent("user-1", "order-1"),
    ).rejects.toThrow(BadRequestException);
  });
});
