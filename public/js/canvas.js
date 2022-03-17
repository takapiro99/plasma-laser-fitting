// https://gist.github.com/dzhang123/2a3a611b3d75a45a3f41
// https://stackoverflow.com/questions/59352578/how-to-zoom-an-image-in-canvas-from-center-of-canvas
const trackTransforms = (ctx) => {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var xform = svg.createSVGMatrix();
  const scale = ctx.scale;
  ctx.scale = (sx, sy) => {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };
  const setTransform = ctx.setTransform;
  ctx.setTransform = (a, b, c, d, e, f) => {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };
  const pt = svg.createSVGPoint();
  ctx.transformedPoint = (x, y) => {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };
};

window.trackTransforms = trackTransforms;
