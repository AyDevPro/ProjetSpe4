// backend/utils/validation.js
module.exports.isSafeString = (input) => {
  if (typeof input !== "string") return false;

  const dangerousPatterns = [
    /^\s*$/, // vide ou juste des espaces
    /^\{.*\$.*\}$/, // injection type {"$gt": ""}
    /<script.*?>/i, // tentative d'injection XSS
    /[\{\}\$]/, // caractères suspects en général
  ];

  return !dangerousPatterns.some((regex) => regex.test(input));
};
