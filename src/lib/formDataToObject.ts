export function formDataToObject(formData: FormData) {
  const obj: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      obj[key] = value;
    }
  }
  return obj;
}