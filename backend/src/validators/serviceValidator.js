function validatePublish(service, packages) {
  const missing = [];
  if (!service.title || !service.title.trim()) missing.push('title');
  if (!service.description || !service.description.trim()) missing.push('description');
  if (!service.categoryId) missing.push('categoryId');

  const validPackages = packages.filter(
    (p) => p.name && p.scope && p.price > 0 && Number.isInteger(p.deliveryDays) && p.deliveryDays > 0
  );
  if (validPackages.length === 0) missing.push('packages');

  return { valid: missing.length === 0, missing };
}

function validateFields(body) {
  const errors = [];

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') errors.push('title debe ser texto');
    else if (body.title.length > 80) errors.push('title no puede superar 80 caracteres');
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') errors.push('description debe ser texto');
    else if (body.description.length > 1200) errors.push('description no puede superar 1200 caracteres');
  }

  if (body.packages !== undefined) {
    if (!Array.isArray(body.packages)) {
      errors.push('packages debe ser un array');
    } else if (body.packages.length > 3) {
      errors.push('Un servicio puede tener máximo 3 paquetes');
    } else {
      body.packages.forEach((pkg, i) => {
        if (pkg.name !== undefined) {
          if (typeof pkg.name !== 'string') errors.push(`packages[${i}].name debe ser texto`);
          else if (pkg.name.length > 50) errors.push(`packages[${i}].name no puede superar 50 caracteres`);
        }
        if (pkg.scope !== undefined) {
          if (typeof pkg.scope !== 'string') errors.push(`packages[${i}].scope debe ser texto`);
          else if (pkg.scope.length > 500) errors.push(`packages[${i}].scope no puede superar 500 caracteres`);
        }
        if (pkg.price !== undefined && (typeof pkg.price !== 'number' || pkg.price <= 0)) {
          errors.push(`packages[${i}].price debe ser un número positivo`);
        }
        if (pkg.deliveryDays !== undefined && (!Number.isInteger(pkg.deliveryDays) || pkg.deliveryDays <= 0)) {
          errors.push(`packages[${i}].deliveryDays debe ser un entero positivo`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePublish, validateFields };
