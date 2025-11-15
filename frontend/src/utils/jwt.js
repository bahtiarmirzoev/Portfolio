
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};


export const getRolesFromToken = (token) => {
  if (!token) return [];
  
  const decoded = decodeJWT(token);
  if (!decoded) return [];
  
  // Роли могут быть в разных форматах: массив или строка
  const roleClaim = decoded.Role || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
  if (Array.isArray(roleClaim)) {
    return roleClaim;
  } else if (typeof roleClaim === 'string') {
    return [roleClaim];
  }
  
  return [];
};


export const isTrustedUser = (token) => {
  const roles = getRolesFromToken(token);
  return roles.includes('trusted_user');
};


export const isAdmin = (token) => {
  const roles = getRolesFromToken(token);
  return roles.includes('admin');
};

