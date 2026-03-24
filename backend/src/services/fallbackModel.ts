export class FallbackModel {
  generateChatReply(message: string, context: string): string {
    return [
      "[Fallback local model activo]",
      "No se detectó Triton o hubo error de inferencia.",
      `Resumen del contexto: ${context.slice(0, 300)}`,
      `Respuesta sugerida para: \"${message}\"`,
      "Puedes conectar Triton para obtener respuestas del modelo NVIDIA real."
    ].join("\n");
  }

  generateCompletion(prefix: string): string {
    return `${prefix}\n// TODO: completar esta lógica con implementación específica del proyecto.`;
  }
}
