export const validatePasswordSecurity = (password: string) => {
  const validationErrors: string[] = [];

  const passwordRules = {
    length: {
      quantity: 0,
      label: "tamanho",
      minimumQuantity: 8
    },
    lowerCase: {
      quantity: 0,
      label: "letras minúsculas",
      minimumQuantity: 1
    },
    upperCase: { quantity: 0, label: "letras maiúsculas", minimumQuantity: 1 },
    numbers: { quantity: 0, label: "números", minimumQuantity: 1 },
    symbols: { quantity: 0, label: "símbolos", minimumQuantity: 1 }
  };

  for (const currentCharacter of password) {
    if (/[a-z]/.test(currentCharacter)) {
      passwordRules.lowerCase.quantity++;
    } else if (/[A-Z]/.test(currentCharacter)) {
      passwordRules.upperCase.quantity++;
    } else if (/[0-9]/.test(currentCharacter)) {
      passwordRules.numbers.quantity++;
    } else {
      passwordRules.symbols.quantity++;
    }
  }

  const createErrorMessage = (rule: {
    quantity: number;
    label: string;
    minimumQuantity: number;
  }) => {
    return `Senha deve possuir no mínimo ${rule.minimumQuantity} caracteres de ${rule.label}`;
  };

  if (password.length < passwordRules.length.minimumQuantity) {
    validationErrors.push(createErrorMessage(passwordRules.length));
  }

  if (
    passwordRules.lowerCase.quantity < passwordRules.lowerCase.minimumQuantity
  ) {
    validationErrors.push(createErrorMessage(passwordRules.lowerCase));
  }

  if (
    passwordRules.upperCase.quantity < passwordRules.upperCase.minimumQuantity
  ) {
    validationErrors.push(createErrorMessage(passwordRules.upperCase));
  }

  if (passwordRules.numbers.quantity < passwordRules.numbers.minimumQuantity) {
    validationErrors.push(createErrorMessage(passwordRules.numbers));
  }

  if (passwordRules.symbols.quantity < passwordRules.symbols.minimumQuantity) {
    validationErrors.push(createErrorMessage(passwordRules.symbols));
  }

  return validationErrors;
};
