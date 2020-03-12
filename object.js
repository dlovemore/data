var p=print=console.log

function thing(p) {
  for(var a in p) {
    this[a]=p[a]
  }
}

function map(f,o,n) {
  n=n || []
  for(var a in o) {
    n[a]=f(o[a])
  }
  return n;
}

function mapd(f,o) { return map(f,o,{}); }

function copyd(o) { return map(I,o); }

function fun(o) {
  var f=new thing(o)
  f.f=eval('(function'+o.args+'{ var v={};'+o.code+';})')
  return f
}

function I(x) { return x; }

function rebuild(o) {
  if(typeof o!='object') return o
  if ('!' in o) {
    return eval(o['!'])(o)
  } else return o
}

function def(d) {
  return new thing(mapd(rebuild,d))
}

function d(s,v) {
  x={v:v}
  eval(s+'=x.v')
}

p(function(x) {  return x;})
p(eval('(function(x) { return x;})'))
p(def({'a':1, b:2}))
p(def({'a':1, b:2, f: {'!':'fun', 'args': '(x)', 'code': 'return x+1'}}))
p(eval('x=3'))
p(eval('x'))
p(d('zz',12))
p(zz)
