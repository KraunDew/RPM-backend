import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: PayPalLink[];
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: {
    payments?: {
      captures?: {
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }[];
    };
  }[];
}

@Injectable()
export class PaypalService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.getOrThrow<string>('PAYPAL_BASE_URL');

    this.clientId = this.config.getOrThrow<string>('PAYPAL_CLIENT_ID');

    this.clientSecret = this.config.getOrThrow<string>('PAYPAL_CLIENT_SECRET');
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new UnauthorizedException('No se pudo autenticar con PayPal');
    }

    const data = (await response.json()) as {
      access_token: string;
    };

    return data.access_token;
  }

  async createOrder(
    amount: string,
    referenceId: string,
  ): Promise<PayPalOrderResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `rpm-create-${referenceId}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: referenceId,
            description: `Compra RPM - ${referenceId}`,
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException('PayPal no pudo crear la orden');
    }

    return (await response.json()) as PayPalOrderResponse;
  }

  async captureOrder(paypalOrderId: string): Promise<PayPalCaptureResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `rpm-capture-${paypalOrderId}`,
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException(
        'No se pudo capturar el pago de PayPal',
      );
    }

    return (await response.json()) as PayPalCaptureResponse;
  }
  async getOrder(paypalOrderId: string) {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException(
        'No se pudo verificar la orden de PayPal',
      );
    }

    return (await response.json()) as {
      id: string;
      status: string;
      purchase_units: {
        reference_id: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }[];
    };
  }
}
