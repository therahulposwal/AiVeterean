function getRouteAuthAction(pathname, hasToken) {
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/interview');

  if (isProtected && !hasToken) {
    return 'redirect_login';
  }

  return 'allow';
}

module.exports = {
  getRouteAuthAction,
};
