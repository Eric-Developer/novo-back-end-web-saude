type ValidationRule = {
    field: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    isEmail?: boolean;
};

export function validateFields(data: Record<string, any>, rules: ValidationRule[]) {
    const errors: string[] = [];

    for (const rule of rules) {
        const value = data[rule.field];

        // Verifica se o campo é obrigatório
        if (rule.required && !value) {
            errors.push(`${rule.field} é obrigatório.`);
            continue;
        }

        if (typeof value === "string") {
            // Verifica tamanho mínimo
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.field} deve ter pelo menos ${rule.minLength} caracteres.`);
            }

            // Verifica tamanho máximo
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.field} deve ter no máximo ${rule.maxLength} caracteres.`);
            }

            // Verifica se é um email válido
            if (rule.isEmail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(value)) {
                errors.push(`${rule.field} deve ser um email válido.`);
            }
        }
    }

    return errors;
}
