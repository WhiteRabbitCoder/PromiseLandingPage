export const kpiData = [
  {
    value: "16x",
    label: "Más productividad",
    description: "Que un equipo humano realizando el mismo proceso de contacto masivo."
  },
  {
    value: "2.400",
    label: "Llamadas por jornada",
    description: "Frente a 150 del modelo manual — sin desgaste, sin errores de registro."
  },
  {
    value: "86%",
    label: "Reducción de costo",
    description: "Comparado con el proceso humano equivalente para el mismo volumen."
  }
];

export const agentData = [
  {
    id: "sofia",
    index: "01",
    channel: "Voz",
    name: "SofIA",
    nameHtml: "Sof<span class=\"accent\">IA</span>",
    role: "Agente integral de voz",
    description:
      "Llama, escucha, entiende contexto y toma decisiones en tiempo real. En producción con Riwi Calls. Construido sobre ElevenLabs."
  },
  {
    id: "modular",
    index: "02",
    channel: "Motor",
    name: "Motor Modular",
    nameHtml: "Motor<br>Modular",
    role: "Arquitectura escalable",
    description:
      "Orquestado en Node.js con MCP. Cola inteligente y priorización por historial. 86% más eficiente que el proceso humano."
  },
  {
    id: "texto",
    index: "03",
    channel: "Texto",
    name: "Agente Texto",
    nameHtml: "Agente<br>Texto",
    role: "WhatsApp · Telegram · Web",
    description:
      "Mismo nivel de inteligencia conversacional. Canal diferente. Integrado vía API en cualquier plataforma digital."
  }
];

export const implementationSteps = [
  {
    title: "Nos acercamos al cliente",
    description:
      "Entendemos el flujo de trabajo, revisamos datos históricos y mapeamos cada escenario posible de conversación."
  },
  {
    title: "Construimos el agente",
    description:
      "No herramientas genéricas — un agente diseñado exactamente para ese flujo específico, ese lenguaje, ese problema."
  },
  {
    title: "Lo integramos en producción",
    description:
      "El agente opera en el flujo real del cliente. Dashboard en tiempo real. Sin intervención manual. Métricas desde el día uno."
  },
  {
    title: "El equipo hace lo que importa",
    description:
      "Las personas dejan de hacer lo que las agota. El agente cubre el volumen. Ellas cubren lo que ningún agente puede reemplazar."
  }
];

export const marketPills = [
  "Admisiones educativas",
  "Confirmación de citas médicas",
  "Seguimiento de pagos · Banca",
  "Cobranza cartera",
  "Onboarding de clientes",
  "Encuestas masivas",
  "Recordatorios de eventos",
  "Verificación de datos",
  "Cualquier proceso conectado a una base de datos"
];

export const pricingTiers = [
  {
    name: "Starter",
    range: "USD 1.500 - 3.000 / mes",
    target: "Para equipos que necesitan automatizar un flujo repetitivo puntual y quieren ver resultados rapidos sin complejidad tecnica.",
    features: [
      "1 canal principal (voz o texto)",
      "Configuracion inicial de campana con diseno conversacional",
      "Dashboard operativo con metricas en tiempo real",
      "Soporte y optimizacion mensual del agente"
    ],
    highlighted: false
  },
  {
    name: "Growth",
    range: "USD 3.200 - 6.500 / mes",
    target: "Para operaciones con multiples campanas activas que necesitan segmentacion, reintentos inteligentes y acompanamiento cercano.",
    features: [
      "Hasta 2 canales activos (voz + texto)",
      "Priorizacion inteligente por historial de intentos",
      "Reglas de automatizacion por segmento de audiencia",
      "Revision quincenal de performance con el equipo Promise"
    ],
    highlighted: true
  },
  {
    name: "Scale",
    range: "Desde USD 7.000 / mes",
    target: "Para empresas con alto volumen que necesitan arquitectura dedicada, personalizacion profunda y soporte prioritario continuo.",
    features: [
      "Canales y flujos completamente personalizados",
      "Arquitectura modular extendida con microservicios dedicados",
      "SLA garantizado y soporte tecnico prioritario",
      "Roadmap tecnico conjunto con el equipo de ingenieria"
    ],
    highlighted: false
  }
];

export const pricingMatrix = {
  columns: ["Capacidad", "Starter", "Growth", "Scale"],
  rows: [
    ["Canales de atención", "1", "Hasta 2", "Personalizado"],
    ["Dashboard en tiempo real", "Incluido", "Incluido", "Incluido + extendido"],
    ["Reintentos inteligentes", "Parcial", "Completo", "Completo + avanzado"],
    ["Escalamiento a humano", "Incluido", "Incluido", "Incluido"],
    ["Onboarding técnico", "Base", "Guiado", "Dedicado"],
    ["Revisión de performance", "Mensual", "Quincenal", "Semanal"]
  ]
};

export const aboutValues = [
  {
    title: "Precisión antes que plantilla",
    description:
      "No entregamos herramientas genéricas. Diseñamos agentes para el flujo real de cada cliente."
  },
  {
    title: "IA con personas",
    description:
      "Nuestro enfoque es arquitectura híbrida: automatizar desgaste para potenciar criterio humano."
  },
  {
    title: "Evidencia operativa",
    description:
      "Construimos con validación en producción, trazabilidad técnica y mejora continua."
  }
];

export const aboutEvidence = [
  {
    title: "Caso de referencia: RiwiCall",
    description:
      "Primer producto validado con SofIA en un escenario real de admisiones de alto volumen."
  },
  {
    title: "Método de ingeniería",
    description:
      "Requisitos levantados desde operación, priorización iterativa y decisiones técnicas documentadas."
  },
  {
    title: "Arquitectura escalable",
    description:
      "Microservicios desacoplados para evolucionar cada canal sin bloquear al resto del sistema."
  },
  {
    title: "Roadmap claro",
    description:
      "Migración de capacidades de voz al motor modular para consolidar potencia y eficiencia."
  }
];

export const processFlow = [
  {
    title: "1. Entender el cuello de botella",
    description: "Evaluamos la carga actual, la tasa de respuesta y los puntos donde se pierde tiempo."
  },
  {
    title: "2. Diseñar decisiones del agente",
    description:
      "Definimos reglas, variantes del lenguaje y criterios para escalar a humano sin perder contexto."
  },
  {
    title: "3. Conectar datos y canales",
    description:
      "Unimos base de datos, orquestación y canal operativo para ejecutar campañas consistentes."
  },
  {
    title: "4. Lanzar en producción",
    description:
      "Desplegamos por fases para validar resultados, estabilidad y experiencia de usuario final."
  },
  {
    title: "5. Optimizar con métricas",
    description:
      "Medimos desempeño real y afinamos el agente para mantener eficiencia y calidad conversacional."
  }
];

export const architectureBlocks = [
  {
    title: "Orquestador central",
    description:
      "Coordina eventos, prioridades y estado global de campañas para evitar pérdida o duplicidad de tareas."
  },
  {
    title: "Call / Voz",
    description:
      "Ejecuta llamadas automatizadas y aplica decisiones conversacionales en tiempo real."
  },
  {
    title: "Chat / Texto",
    description:
      "Gestiona conversaciones en WhatsApp, Telegram y web con coherencia en lógica de negocio."
  },
  {
    title: "Core IA",
    description:
      "Interpreta lenguaje natural, contexto y ambigüedad para accionar respuestas útiles."
  }
];

export const qualityPillars = [
  {
    title: "Rendimiento",
    description: "Objetivo de operación en alto volumen con degradación controlada."
  },
  {
    title: "Disponibilidad",
    description: "Tolerancia a fallos por microservicio sin colapsar la operación completa."
  },
  {
    title: "Mantenibilidad",
    description: "Módulos desacoplados y trazabilidad para mejorar sin rehacer todo."
  },
  {
    title: "Escalabilidad",
    description: "Capacidad de crecer por cliente, canal y campaña de forma progresiva."
  }
];
