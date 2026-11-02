/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

type EmbeddingTask = 'retrieval.query' | 'retrieval.passage';

type Intent =
  | 'product_search'
  | 'product_question'
  | 'recommendation'
  | 'database_question'
  | 'store_question'
  | 'general_chat'
  | 'unknown';

type SimilarProduct = {
  id_product: string;
  name: string;
  model: string | null;
  sku: string;
  price: number;
  stock: number;
  description: string | null;
  similarity: number;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type GroqOptions = {
  jsonMode?: boolean;
  maxCompletionTokens?: number;
};

type SqlGeneration = {
  sql?: string;
};

@Injectable()
export class IAService {
  private readonly groqApiKey: string;
  private readonly groqModel = 'openai/gpt-oss-20b';
  private readonly groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

  // Umbral mínimo de evidencia para responder.
  private readonly confidenceThreshold = 0.8;

  // Máximo de filas devueltas por consulta.
  private readonly sqlMaxRows = 50;

  // Tablas disponibles para consultas de lectura.
  private readonly allowedTables = new Set([
    'Product',
    'Category',
    'Brand',
    'Supplier',
    'Address',
    'Order',
    'DetailOrder',
  ]);

  // Columnas que nunca deben exponerse.
  private readonly forbiddenColumns = [
    'password',
    'paypalOrderId',
    'paypalCaptureId',
    'id_user',
  ];

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Falta configurar GROQ_API_KEY');
    }

    this.groqApiKey = apiKey;
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  private async measure<T>(
    label: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();

    try {
      return await operation();
    } finally {
      const seconds = (Date.now() - start) / 1000;
      console.log(`[IA] ${label}: ${seconds.toFixed(2)} s`);
    }
  }

  private logError(label: string, error: unknown) {
    console.error(
      `[IA] ${label}:`,
      axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data ?? error.message)
        : error instanceof Error
          ? error.message
          : error,
    );
  }

  private async generateGroqResponse(
    systemInstruction: string,
    userMessage: string,
    options: GroqOptions = {},
  ): Promise<string> {
    const response = await axios.post<GroqResponse>(
      this.groqUrl,
      {
        model: this.groqModel,
        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.2,
        reasoning_effort: 'low',
        max_completion_tokens: options.maxCompletionTokens ?? 600,
        ...(options.jsonMode
          ? {
              response_format: {
                type: 'json_object',
              },
            }
          : {}),
      },
      {
        timeout: 25_000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.groqApiKey}`,
        },
      },
    );

    const content = response.data.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Groq no devolvió una respuesta válida');
    }

    return content.trim();
  }

  private normalizeText(message: string): string {
    return message
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[¡!¿?.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // =========================================================
  // CLASIFICACIÓN DE INTENCIONES
  // =========================================================

  private classifyIntentLocally(message: string): Intent {
    const text = this.normalizeText(message);

    if (!text) return 'unknown';

    const greetings =
      /^(hola|holi|hey|hello|buenas|buenos dias|buenas tardes|buenas noches|que tal|como estas|como estai|gracias|muchas gracias|chao|adios)$/;

    if (greetings.test(text)) return 'general_chat';

    const databaseKeywords = [
      'cuantos productos',
      'cuantos repuestos',
      'cuantas marcas',
      'cuantas categorias',
      'cuantos proveedores',
      'productos registrados',
      'productos agotados',
      'sin stock',
      'menos de',
      'mas de',
      'mayor precio',
      'menor precio',
      'producto mas caro',
      'producto mas barato',
      'mas vendidos',
      'mas comprado',
      'total de ventas',
      'total vendido',
      'pedidos registrados',
      'pedidos pagados',
      'pedidos pendientes',
      'estadisticas',
      'inventario',
      'stock total',
      'stock disponible',
      'proveedores registrados',
      'buscar proveedor',
      'listar proveedores',
      'listar productos',
      'mostrar productos',
      'ventas del mes',
      'ventas de hoy',
      'ventas por mes',
      'promedio de precios',
      'precio promedio',
    ];

    if (databaseKeywords.some((keyword) => text.includes(keyword))) {
      return 'database_question';
    }

    const storeKeywords = [
      'horario',
      'horarios',
      'envio',
      'envios',
      'despacho',
      'despachos',
      'garantia',
      'garantias',
      'devolucion',
      'devoluciones',
      'medios de pago',
      'formas de pago',
      'direccion de rpm',
      'contacto de rpm',
      'talleres aliados',
      'politica de',
      'que es rpm',
    ];

    if (storeKeywords.some((keyword) => text.includes(keyword))) {
      return 'store_question';
    }

    const recommendationKeywords = [
      'recomiendame',
      'recomienda',
      'recomendacion',
      'que me conviene',
      'cual deberia comprar',
      'que me sirve',
      'que necesito para',
      'compatibilidad',
      'compatible',
    ];

    if (recommendationKeywords.some((keyword) => text.includes(keyword))) {
      return 'recommendation';
    }

    const productKeywords = [
      'repuesto',
      'repuestos',
      'pastilla de freno',
      'pastillas de freno',
      'disco de freno',
      'frenos',
      'motor',
      'filtro',
      'bujia',
      'bujias',
      'embrague',
      'radiador',
      'amortiguador',
      'neumatico',
      'neumaticos',
      'llanta',
      'llantas',
      'bateria',
      'alternador',
      'correa',
      'aceite',
      'inyector',
      'suspension',
      'parachoques',
      'espejo',
      'automovil',
      'vehiculo',
      'toyota',
      'nissan',
      'hyundai',
      'kia',
      'chevrolet',
      'suzuki',
      'mazda',
      'ford',
      'volkswagen',
    ];

    if (productKeywords.some((keyword) => text.includes(keyword))) {
      const questionKeywords = [
        'que es',
        'para que sirve',
        'como funciona',
        'me sirve',
        'es compatible',
        'que diferencia',
        'cual es la diferencia',
        'cuanto dura',
      ];

      if (questionKeywords.some((keyword) => text.includes(keyword))) {
        return 'product_question';
      }

      return 'product_search';
    }

    return 'unknown';
  }

  async classifyIntent(message: string): Promise<Intent> {
    try {
      const content = await this.measure('Clasificación Groq', () =>
        this.generateGroqResponse(
          `
Clasifica la intención principal del usuario.

Intenciones permitidas:
- product_search: busca uno o varios repuestos.
- product_question: pregunta por características o funcionamiento de piezas.
- recommendation: necesita orientación para elegir repuestos.
- database_question: pregunta por cantidades, inventario, stock, marcas, categorías, proveedores, pedidos, estadísticas o datos almacenados en RPM.
- store_question: pregunta por servicios o políticas de RPM.
- general_chat: saludos y conversación casual.
- unknown: no se puede determinar la intención.

IMPORTANTE:
Si pregunta por cantidades, estadísticas, inventario, precios agrupados,
pedidos, proveedores o información almacenada, utiliza database_question.

Si busca un repuesto específico para su vehículo, utiliza product_search.

Devuelve exclusivamente JSON:
{"intent":"database_question"}
            `,
          `Mensaje:\n${message}`,
          {
            jsonMode: true,
            maxCompletionTokens: 300,
          },
        ),
      );

      const parsed = JSON.parse(content) as {
        intent?: string;
      };

      const allowed: Intent[] = [
        'product_search',
        'product_question',
        'recommendation',
        'database_question',
        'store_question',
        'general_chat',
        'unknown',
      ];

      if (
        typeof parsed.intent === 'string' &&
        allowed.includes(parsed.intent as Intent)
      ) {
        return parsed.intent as Intent;
      }

      return this.classifyIntentLocally(message);
    } catch (error) {
      this.logError('Error clasificando intención', error);
      return this.classifyIntentLocally(message);
    }
  }

  // =========================================================
  // EMBEDDINGS JINA
  // =========================================================

  async generateEmbed(
    message: string,
    task: EmbeddingTask = 'retrieval.passage',
  ): Promise<number[] | undefined> {
    try {
      const token = process.env.IA_TOKEN;

      if (!token) {
        throw new Error('Falta configurar IA_TOKEN');
      }

      const response = await this.measure('Solicitud de embeddings Jina', () =>
        axios.post(
          'https://api.jina.ai/v1/embeddings',
          {
            model: 'jina-embeddings-v3',
            input: [message],
            task,
          },
          {
            timeout: 15_000,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      const embedding = response.data?.data?.[0]?.embedding;

      if (
        !Array.isArray(embedding) ||
        !embedding.every((value: unknown) => typeof value === 'number')
      ) {
        throw new Error('Jina no devolvió un embedding válido');
      }

      return embedding;
    } catch (error) {
      this.logError('Error generando embedding', error);
      return undefined;
    }
  }

  async generateProductEmbedding(idProduct: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id_product: idProduct,
      },
    });

    if (!product) {
      throw new NotFoundException('Repuesto no encontrado');
    }

    const content = [
      `Nombre: ${product.name}`,
      `Modelo: ${product.model ?? ''}`,
      `SKU: ${product.sku}`,
      `Material: ${product.material ?? ''}`,
      `Descripción: ${product.description ?? ''}`,
    ].join('\n');

    const embedding = await this.generateEmbed(content, 'retrieval.passage');

    if (!embedding) {
      throw new Error('No se pudo generar el embedding del producto');
    }

    const vector = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      UPDATE "Product"
      SET "embedding" = ${vector}::vector
      WHERE "id_product" = ${idProduct}
    `;

    return {
      message: 'Embedding guardado correctamente',
      id_product: idProduct,
    };
  }

  async searchSimilarProducts(
    message: string,
    limit = 5,
  ): Promise<SimilarProduct[] | null> {
    const embedding = await this.generateEmbed(message, 'retrieval.query');

    if (!embedding) return null;

    const vector = `[${embedding.join(',')}]`;

    return this.measure(
      'Búsqueda vectorial PostgreSQL',
      () =>
        this.prisma.$queryRaw<SimilarProduct[]>`
          SELECT
            "id_product",
            "name",
            "model",
            "sku",
            "price",
            "stock",
            "description",
            1 - ("embedding" <=> ${vector}::vector) AS similarity
          FROM "Product"
          WHERE "embedding" IS NOT NULL
          ORDER BY "embedding" <=> ${vector}::vector
          LIMIT ${limit}
        `,
    );
  }

  // =========================================================
  // SQL DINÁMICO DE SOLO LECTURA
  // =========================================================

  private getSqlSchemaDescription(): string {
    return `
ESQUEMA REAL DE RPM:

Product:
- id_product TEXT
- id_supplier TEXT
- id_category TEXT
- id_brand TEXT
- photo_path TEXT
- sku TEXT
- name TEXT
- model TEXT nullable
- material TEXT nullable
- weight DECIMAL nullable
- price INTEGER
- description TEXT nullable
- stock INTEGER
- embedding VECTOR (NO CONSULTAR)

Category:
- id_category TEXT
- name TEXT
- description TEXT nullable

Brand:
- id_brand TEXT
- name TEXT
- country_origin TEXT nullable

Supplier:
- id_supplier TEXT
- name TEXT
- email TEXT
- phone_number TEXT
- role TEXT

Address:
- id_address TEXT
- street TEXT
- house_number TEXT
- department TEXT nullable
- block TEXT nullable
- comune TEXT
- region TEXT
- reference TEXT nullable
- id_supplier TEXT nullable

"Order":
- id_order TEXT
- date TIMESTAMP
- total INTEGER
- method TEXT
- status TEXT
- currency TEXT
- paymentAmount DECIMAL nullable
- exchangeRate DECIMAL nullable
- paidAt TIMESTAMP nullable

DetailOrder:
- id_detail TEXT
- id_order TEXT
- id_product TEXT
- amount INTEGER
- unit_price INTEGER

RELACIONES:
- Product.id_supplier = Supplier.id_supplier
- Product.id_category = Category.id_category
- Product.id_brand = Brand.id_brand
- Address.id_supplier = Supplier.id_supplier
- DetailOrder.id_order = Order.id_order
- DetailOrder.id_product = Product.id_product

REGLAS:
- Usa nombres exactos y comillas dobles para tablas y columnas.
- PostgreSQL distingue mayúsculas en identificadores entre comillas.
- Usa exclusivamente SELECT.
- No consultes User, AIConversation, AIMessage ni AIUserMemory.
- No consultes contraseñas ni identificadores personales.
- No consultes paypalOrderId ni paypalCaptureId.
- No consultes id_user.
- No consultes embedding.
- No uses SELECT *.
- No uses funciones del sistema, archivos, extensiones ni catálogos internos.
- No inventes nombres de columnas.
- Usa LIMIT cuando corresponda.
- Puedes utilizar JOIN, COUNT, SUM, AVG, MIN, MAX, GROUP BY y ORDER BY.
- Los pedidos pueden consultarse mediante sus datos comerciales,
  pero nunca mediante identificadores personales o credenciales.
`;
  }

  private cleanGeneratedSql(value: string): string {
    return value
      .replace(/^```(?:sql)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  private validateReadOnlySql(sql: string): {
    valid: boolean;
    reason?: string;
  } {
    const query = sql.trim();

    if (!query) {
      return {
        valid: false,
        reason: 'La consulta está vacía.',
      };
    }

    // Una sola sentencia.
    if (query.includes(';')) {
      return {
        valid: false,
        reason: 'No se permiten consultas múltiples.',
      };
    }

    // Solo SELECT.
    if (!/^SELECT\b/i.test(query)) {
      return {
        valid: false,
        reason: 'Solo se permiten consultas SELECT.',
      };
    }

    // Bloquea comentarios y caracteres usados para manipular SQL.
    if (
      query.includes('--') ||
      query.includes('/*') ||
      query.includes('*/') ||
      query.includes('\\')
    ) {
      return {
        valid: false,
        reason: 'La consulta contiene sintaxis no permitida.',
      };
    }

    // Bloquea operaciones y comandos peligrosos.
    const forbiddenOperations =
      /\b(INSERT|UPDATE|DELETE|UPSERT|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|CALL|DO|EXECUTE|EXEC|VACUUM|ANALYZE|REFRESH|LOCK|SET|RESET|PREPARE|DEALLOCATE|INTO|NEXTVAL|SETVAL|PG_SLEEP|PG_READ_FILE|PG_WRITE_FILE|LO_IMPORT|LO_EXPORT)\b/i;

    if (forbiddenOperations.test(query)) {
      return {
        valid: false,
        reason: 'La consulta contiene una operación prohibida.',
      };
    }

    // Evita acceso a metadatos y esquemas internos.
    if (
      /\b(information_schema|pg_catalog|pg_toast|current_setting|current_user|session_user)\b/i.test(
        query,
      )
    ) {
      return {
        valid: false,
        reason: 'No se permite consultar metadatos internos.',
      };
    }

    // Evita acceso a tablas sensibles incluso mediante subconsultas.
    if (/"\s*(User|AIConversation|AIMessage|AIUserMemory)\s*"/i.test(query)) {
      return {
        valid: false,
        reason: 'La tabla solicitada no está autorizada.',
      };
    }

    // Bloquea columnas sensibles.
    for (const column of this.forbiddenColumns) {
      const pattern = new RegExp(`"${column}"`, 'i');

      if (pattern.test(query)) {
        return {
          valid: false,
          reason: `La columna ${column} no está autorizada.`,
        };
      }
    }

    // Evita SELECT * y alias.*.
    if (
      /\bSELECT\s+\*/i.test(query) ||
      /,\s*[a-zA-Z_][a-zA-Z0-9_]*\.\*/.test(query) ||
      /\b[a-zA-Z_][a-zA-Z0-9_]*\.\*/.test(query)
    ) {
      return {
        valid: false,
        reason: 'Debes especificar las columnas que necesitas.',
      };
    }

    // Comprueba todas las tablas indicadas en FROM y JOIN.
    const tablePattern = /\b(?:FROM|JOIN)\s+"?([a-zA-Z_][a-zA-Z0-9]*)"?/gi;

    const referencedTables: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = tablePattern.exec(query)) !== null) {
      referencedTables.push(match[1]);
    }

    if (referencedTables.length === 0) {
      return {
        valid: false,
        reason: 'No se encontraron tablas autorizadas.',
      };
    }

    for (const table of referencedTables) {
      if (!this.allowedTables.has(table)) {
        return {
          valid: false,
          reason: `La tabla ${table} no está autorizada.`,
        };
      }
    }

    // Evita consultas excesivamente grandes.
    if (query.length > 5000) {
      return {
        valid: false,
        reason: 'La consulta supera el tamaño permitido.',
      };
    }

    // Evita consultas sin límite de resultados.
    if (!/\bLIMIT\s+\d+\b/i.test(query)) {
      return {
        valid: false,
        reason: 'La consulta debe incluir LIMIT.',
      };
    }

    const limitMatch = query.match(/\bLIMIT\s+(\d+)\b/i);
    const requestedLimit = limitMatch ? Number(limitMatch[1]) : 0;

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > this.sqlMaxRows
    ) {
      return {
        valid: false,
        reason: `El límite máximo es ${this.sqlMaxRows} resultados.`,
      };
    }

    return { valid: true };
  }

  private async generateSqlQuery(
    question: string,
    history: string,
  ): Promise<string> {
    const content = await this.generateGroqResponse(
      `
Eres un generador de consultas SQL para RPM.

Tu única función es transformar preguntas en consultas PostgreSQL
de lectura sobre el esquema proporcionado.

${this.getSqlSchemaDescription()}

REGLAS CRÍTICAS:
1. Genera exclusivamente una consulta SELECT.
2. No generes explicaciones ni texto adicional.
3. No inventes tablas ni columnas.
4. No utilices SELECT *.
5. Incluye LIMIT 50 como máximo.
6. Nunca consultes datos de usuarios.
7. Nunca consultes credenciales ni datos de pago sensibles.
8. Si la pregunta no se puede responder usando el esquema,
   devuelve {"sql": null}.
9. Si falta información para interpretar una referencia,
   no inventes filtros.
10. Utiliza JOIN para relacionar modelos.
11. Usa alias claros.
12. Para contar registros, utiliza COUNT.
13. Para estadísticas, utiliza agregaciones SQL.
14. No utilices CTE, subconsultas recursivas ni funciones del sistema.
15. No ejecutes ni propongas modificaciones.

Devuelve exclusivamente JSON válido:
{"sql":"SELECT ... LIMIT 50"}

Si no es posible:
{"sql":null}
      `,
      `
CONTEXTO DE CONVERSACIÓN:
${history}

PREGUNTA ACTUAL:
${question}
      `,
      {
        jsonMode: true,
        maxCompletionTokens: 700,
      },
    );

    const parsed = JSON.parse(content) as SqlGeneration;

    if (typeof parsed.sql !== 'string' || !parsed.sql.trim()) {
      throw new Error(
        'No se pudo generar una consulta SQL para esta pregunta.',
      );
    }

    return this.cleanGeneratedSql(parsed.sql);
  }

  private async executeReadOnlyQuery(
    sql: string,
  ): Promise<Record<string, unknown>[]> {
    const validation = this.validateReadOnlySql(sql);

    if (!validation.valid) {
      throw new Error(validation.reason ?? 'Consulta SQL no permitida.');
    }

    return this.measure('Ejecución SQL de solo lectura', () =>
      this.prisma.$transaction(
        async (transaction) => {
          // PostgreSQL impide modificaciones en esta transacción.
          await transaction.$executeRawUnsafe('SET TRANSACTION READ ONLY');

          return transaction.$queryRawUnsafe<Record<string, unknown>[]>(sql);
        },
        {
          timeout: 12_000,
          maxWait: 5_000,
        },
      ),
    );
  }

  // La puntuación evalúa evidencia disponible, no la seguridad
  // subjetiva declarada por el modelo.
  private calculateConfidence(
    sql: string,
    results: Record<string, unknown>[],
  ): number {
    const validation = this.validateReadOnlySql(sql);

    if (!validation.valid) return 0;

    // La consulta fue validada y PostgreSQL la ejecutó correctamente.
    if (results.length > 0) return 0.95;

    // Una consulta válida sin resultados también es evidencia:
    // no se encontraron coincidencias para los filtros solicitados.
    return 0.9;
  }

  private async generateDatabaseResponse(
    question: string,
    sql: string,
    results: Record<string, unknown>[],
    confidence: number,
  ): Promise<string> {
    if (confidence < this.confidenceThreshold) {
      return 'No tengo evidencia suficiente para responder esa consulta con seguridad. ¿Puedes precisar un poco más lo que necesitas?';
    }

    if (results.length === 0) {
      return 'No encontré registros que coincidan con esa consulta en la base de datos de RPM. Puedes probar con otros filtros o términos.';
    }

    const content = await this.generateGroqResponse(
      `
Eres Piston, el asistente virtual de RPM.

Tu trabajo es explicar resultados reales obtenidos desde PostgreSQL.

REGLAS:
- Utiliza exclusivamente los datos entregados.
- No inventes cifras, productos, precios ni conclusiones.
- No afirmes que un producto es compatible si los resultados no lo demuestran.
- No confundas cantidades de pedidos con unidades vendidas.
- Si los datos no permiten responder completamente, dilo.
- Si hay varios resultados, resume los más importantes.
- Usa pesos chilenos (CLP) cuando corresponda.
- Responde en español chileno natural.
- No muestres SQL al usuario salvo que lo solicite.
- No inventes causas ni explicaciones para los datos.
- Si hay una limitación en los resultados, explícalo.
- Evita repetir innecesariamente los datos.
      `,
      `
PREGUNTA:
${question}

CONSULTA EJECUTADA:
${sql}

RESULTADOS REALES DE POSTGRESQL:
${JSON.stringify(results)}

CONFIANZA DE EVIDENCIA:
${Math.round(confidence * 100)} %

Responde la pregunta del usuario utilizando esos resultados.
      `,
      {
        maxCompletionTokens: 700,
      },
    );

    return content;
  }

  private async answerDatabaseQuestion(
    question: string,
    history: string,
  ): Promise<{
    message: string;
    confidence: number;
    results: Record<string, unknown>[];
  }> {
    try {
      const sql = await this.measure('Generación de consulta SQL', () =>
        this.generateSqlQuery(question, history),
      );

      const validation = this.validateReadOnlySql(sql);

      if (!validation.valid) {
        console.warn('[IA] Consulta SQL rechazada:', validation.reason);

        return {
          message:
            'No pude construir una consulta segura para responder eso. Prueba formulando la pregunta de otra manera.',
          confidence: 0,
          results: [],
        };
      }

      const results = await this.executeReadOnlyQuery(sql);

      const confidence = this.calculateConfidence(sql, results);

      const message = await this.generateDatabaseResponse(
        question,
        sql,
        results,
        confidence,
      );

      return {
        message,
        confidence,
        results,
      };
    } catch (error) {
      this.logError('Error en consulta SQL', error);

      return {
        message:
          'No pude consultar la información de RPM en este momento. La base de datos no respondió como esperaba. Intenta nuevamente más tarde.',
        confidence: 0,
        results: [],
      };
    }
  }

  // =========================================================
  // RESPUESTAS DE PRODUCTOS
  // =========================================================

  async generateProductResponse(
    question: string,
    products: SimilarProduct[],
  ): Promise<string> {
    if (products.length === 0) {
      return 'No encontré repuestos relacionados con tu consulta. Puedes intentar con otro nombre, marca o modelo de vehículo.';
    }

    const systemInstruction = `
Eres Piston, el asistente virtual oficial de RPM,
un ecommerce de repuestos automotrices.

Tu ámbito es automotriz y de información confirmada de RPM.

REGLAS:
1. No inventes productos, precios, stock ni compatibilidades.
2. No afirmes compatibilidad sin evidencia concreta.
3. Si faltan marca, modelo o año, solicita esos datos.
4. Si los resultados no son suficientes, dilo.
5. No respondas preguntas ajenas al mundo automotriz.
6. Responde en español chileno natural.
7. No inventes políticas de RPM.
8. Diferencia entre similitud semántica y compatibilidad real.
9. No afirmes que un producto sirve para un vehículo solo porque
   apareció en una búsqueda vectorial.
10. Si hay dudas, pide verificar la versión exacta del vehículo.
`;

    const contents = `
PREGUNTA:
${question}

PRODUCTOS RECUPERADOS:
${JSON.stringify(products)}

Responde de forma clara y breve.
Menciona precios y stock cuando corresponda.
No inventes información.
`;

    try {
      return await this.measure('Respuesta Groq de productos', () =>
        this.generateGroqResponse(systemInstruction, contents, {
          maxCompletionTokens: 900,
        }),
      );
    } catch (error) {
      this.logError('Error generando respuesta de productos', error);

      const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        }).format(price);

      const productList = products
        .map((product) => {
          const stockText =
            product.stock > 0
              ? `${product.stock} unidades registradas`
              : 'Sin unidades registradas en stock';

          return [
            `• ${product.name}`,
            `  Modelo: ${product.model ?? 'No informado'}`,
            `  SKU: ${product.sku}`,
            `  Precio: ${formatPrice(product.price)}`,
            `  Stock: ${stockText}`,
            product.description ? `  Descripción: ${product.description}` : '',
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');

      return [
        'Encontré estos repuestos relacionados con tu consulta:',
        '',
        productList,
        '',
        'La similitud de búsqueda no garantiza compatibilidad. Verifica la versión exacta de tu vehículo antes de comprar.',
      ].join('\n');
    }
  }

  // =========================================================
  // CHAT Y CONSULTAS DE LA TIENDA
  // =========================================================

  async generateChatResponse(
    message: string,
    intent: 'general_chat' | 'store_question',
  ): Promise<string> {
    const instructions =
      intent === 'store_question'
        ? `
El usuario pregunta por RPM.

No tienes documentación oficial completa sobre políticas,
envíos, garantías, devoluciones ni otros servicios.

No inventes esta información.
Si no tienes datos confirmados, dilo y recomienda consultar
los canales oficiales de RPM.
`
        : `
El usuario está conversando contigo.

Puedes responder saludos, agradecimientos y despedidas.
Tu especialidad es el mundo automotriz y RPM.

Si pregunta algo ajeno a ese ámbito, responde amablemente
que eres el asistente de RPM y redirige la conversación.
`;

    try {
      return await this.measure('Chat Groq', () =>
        this.generateGroqResponse(
          `
Eres Piston, el asistente virtual de RPM.

Responde en español chileno, con naturalidad y brevedad.
No inventes información de la tienda.

${instructions}
            `,
          message,
          {
            maxCompletionTokens: 500,
          },
        ),
      );
    } catch (error) {
      this.logError('Error generando respuesta de chat', error);

      if (intent === 'general_chat') {
        return '¡Hola! Soy Piston, el asistente de RPM. Cuéntame qué repuesto buscas o qué necesitas revisar de tu vehículo. 🚗';
      }

      return 'No puedo confirmar esa información de RPM en este momento. Te recomiendo consultar los canales oficiales de la tienda.';
    }
  }

  // =========================================================
  // HISTORIAL Y MEMORIA
  // =========================================================

  async askAssistant(
    message: string,
    userId: string | null,
    conversationId?: string,
  ) {
    return this.measure('Tiempo total del asistente', async () => {
      const question = message.trim();

      if (!question) {
        return {
          intent: 'unknown' as Intent,
          message: 'Escribe una consulta para que pueda ayudarte.',
          products: [],
          conversationId: conversationId ?? null,
          confidence: 0,
        };
      }

      // Verifica la cuenta solo cuando hay un usuario autenticado.
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: {
            id_user: userId,
          },
          select: {
            id_user: true,
          },
        });

        if (!user) {
          throw new NotFoundException('Usuario no encontrado.');
        }
      }

      // Recupera o crea una conversación.
      let conversation;

      if (conversationId) {
        conversation = await this.prisma.aIConversation.findFirst({
          where: {
            id_conversation: conversationId,
            id_user: userId,
          },
          select: {
            id_conversation: true,
          },
        });

        if (!conversation) {
          throw new NotFoundException(
            'La conversación no existe o no te pertenece.',
          );
        }
      } else {
        conversation = await this.prisma.aIConversation.create({
          data: {
            id_user: userId,
            title: question.slice(0, 80),
          },
          select: {
            id_conversation: true,
          },
        });
      }

      const currentConversationId = conversation.id_conversation;

      // Recupera historial anterior.
      const previousMessages = await this.prisma.aIMessage.findMany({
        where: {
          id_conversation: currentConversationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 12,
        select: {
          role: true,
          content: true,
        },
      });

      const history = previousMessages.reverse();

      // Los recuerdos solo existen para usuarios registrados.
      const memories = userId
        ? await this.prisma.aIUserMemory.findMany({
            where: {
              id_user: userId,
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 20,
            select: {
              key: true,
              value: true,
            },
          })
        : [];

      const memoryContext = memories.length
        ? memories
            .map((memory) => `- ${memory.key}: ${memory.value}`)
            .join('\n')
        : 'No hay recuerdos persistentes disponibles.';

      // Guarda el mensaje actual.
      await this.prisma.aIMessage.create({
        data: {
          id_conversation: currentConversationId,
          role: 'USER',
          content: question,
        },
      });

      const historyContext = history.length
        ? history
            .map(
              (item) =>
                `${item.role === 'USER' ? 'Usuario' : 'Piston'}: ${item.content}`,
            )
            .join('\n')
        : 'Primera interacción de esta conversación.';

      const contextualQuestion = `
RECUERDOS DISPONIBLES:
${memoryContext}

HISTORIAL RECIENTE:
${historyContext}

MENSAJE ACTUAL:
${question}
        `.trim();

      // Clasifica utilizando el contexto.
      const intent = await this.measure('Clasificación de intención', () =>
        this.classifyIntent(contextualQuestion),
      );

      let responseMessage = '';
      let products: SimilarProduct[] = [];
      let confidence = 0;

      switch (intent) {
        case 'database_question': {
          const result = await this.measure('Consulta de base de datos', () =>
            this.answerDatabaseQuestion(question, historyContext),
          );

          responseMessage = result.message;
          confidence = result.confidence;
          break;
        }

        case 'product_search':
        case 'product_question':
        case 'recommendation': {
          const foundProducts = await this.measure(
            'Búsqueda vectorial completa',
            () => this.searchSimilarProducts(question),
          );

          if (foundProducts === null) {
            responseMessage =
              'No pude realizar la búsqueda de repuestos en este momento. Intenta nuevamente.';
            confidence = 0;
            break;
          }

          products = foundProducts;

          responseMessage = await this.measure(
            'Generación de respuesta de productos',
            () =>
              this.generateProductResponse(contextualQuestion, foundProducts),
          );

          // La similitud vectorial es una señal de relevancia,
          // no una prueba de compatibilidad.
          confidence = foundProducts.length > 0 ? 0.8 : 0.9;

          break;
        }

        case 'store_question':
        case 'general_chat': {
          responseMessage = await this.measure(
            'Generación de respuesta de chat',
            () => this.generateChatResponse(contextualQuestion, intent),
          );

          confidence = 0.8;
          break;
        }

        default: {
          responseMessage =
            'No alcancé a identificar qué necesitas. Puedes contarme qué repuesto buscas, qué vehículo tienes o qué información de RPM quieres consultar.';
          confidence = 0;
        }
      }

      // Guarda la respuesta.
      await this.prisma.aIMessage.create({
        data: {
          id_conversation: currentConversationId,
          role: 'ASSISTANT',
          content: responseMessage,
        },
      });

      // Actualiza la actividad.
      await this.prisma.aIConversation.update({
        where: {
          id_conversation: currentConversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      // Guarda preferencias explícitas solo si hay cuenta.
      if (userId) {
        const preferenceMatch = question.match(
          /(?:recuerda que|ten en cuenta que|mi auto es|mi vehiculo es|tengo un|tengo una)\s+(.{3,120})/i,
        );

        if (preferenceMatch) {
          const value = preferenceMatch[1].trim();

          await this.prisma.aIUserMemory.upsert({
            where: {
              id_user_key: {
                id_user: userId,
                key: 'preferencia_vehiculo',
              },
            },
            create: {
              id_user: userId,
              key: 'preferencia_vehiculo',
              value,
            },
            update: {
              value,
            },
          });
        }
      }

      return {
        intent,
        message: responseMessage,
        products,
        conversationId: currentConversationId,
        confidence,
      };
    });
  }
}
