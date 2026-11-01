import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
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

interface PayPalGetOrderResponse {
  id: string;
  status: string;
  purchase_units: {
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }[];
}

@Injectable()
export class PaypalService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config
      .getOrThrow<string>('PAYPAL_BASE_URL')
      .replace(/\/+$/, '');

    this.clientId = this.config.getOrThrow<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.config.getOrThrow<string>('PAYPAL_CLIENT_SECRET');

    this.frontendUrl = this.config
      .getOrThrow<string>('FRONTEND_URL')
      .replace(/\/+$/, '');
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
      const details = await response.text();
      console.error('PayPal OAuth error:', details);
      throw new BadGatewayException(
        'PayPal no pudo autenticar al servidor de RPM.',
      );
    }

    const data = (await response.json()) as { access_token?: string };

    if (!data.access_token) {
      throw new BadGatewayException(
        'PayPal no devolvió un token de acceso válido.',
      );
    }

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
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'RPM Repuestos Automotrices',
              landing_page: 'LOGIN',
              user_action: 'PAY_NOW',
              return_url: `${this.frontendUrl}/carrito?paypal=success`,
              cancel_url: `${this.frontendUrl}/carrito?paypal=cancel`,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('PayPal create order error:', details);
      throw new InternalServerErrorException(
        'PayPal no pudo crear la orden de pago.',
      );
    }

    const data = (await response.json()) as PayPalOrderResponse;

    if (!data.id || !Array.isArray(data.links)) {
      console.error('PayPal create order returned an invalid response:', data);
      throw new BadGatewayException(
        'PayPal devolvió una respuesta incompleta al crear la orden.',
      );
    }

    return data;
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
      const details = await response.text();
      console.error('PayPal capture order error:', details);
      throw new InternalServerErrorException(
        'No se pudo capturar el pago de PayPal.',
      );
    }

    return (await response.json()) as PayPalCaptureResponse;
  }

  async getOrder(paypalOrderId: string): Promise<PayPalGetOrderResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error('PayPal get order error:', details);
      throw new InternalServerErrorException(
        'No se pudo verificar la orden de PayPal.',
      );
    }

    return (await response.json()) as PayPalGetOrderResponse;
  }
}
