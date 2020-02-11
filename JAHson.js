JAHson = {
'read': ((x) => eval(x))
}
print=p=console.log;
function pj(x) {
  print(JSON.stringify(x))
}
p(JAHson.read("[1,2,{'a':3,'b':4}]"))
o=[1,2]
o[4]=4
o[3]={'x':[11,11]}
o['s']='sheep'
//o[0]=o
pj(o)
a={}
a[1]=true
p(!(1 in a))
seen={}
seen[o]='o';
p(seen[o])
for(i in o[3])
   p(''+o[3]+'[',i,']=',o[i]);
{
  function I(x) { return x; }
  function T(x) {
    var t = typeof x;
    if (typeof x == 'string') return x;
    if (typeof x == 'number') return x;
    var ot = Object.prototype.toString.call(x);
    if(ot == '[object Array]') return 'array';
    return ot;
  }
  function d(x) {
    if (typeof x == 'string') return [];
    if (typeof x == 'number') return [];
    return x;
  }
  function anychildren(x) {
    for(var i in x) {
      return true;
    }
    return false;
  }

  function s(x,f1,f2) {
    var seen={};
    function t(x) {
      if (!(x in seen)) {
        seen[x]=true
        if (anychildren(x)) {
          var c=d(x)
          var y={}
          if (T(x)=='array') {
            var a=[];
            for(var i in x) {
              a[i]=t(x[i]);
            }
            return a;
          }
          for(var i in c) {
            y[i]=t(c[i])
          }
          y.T=T(x)
          return y
        }
        return f1(x)
      } else {
        if (seen[x]==true) {
          seen[x]=f2(x)
        }
        return seen[x]
      }
    }
    return t(x)
  }

  function unlink(t) {
    var d={};
    function f(x) {
      if(!(x in d)) {
        t.push(x);
        d[x]={'ref':t.length};
      }
      return d[x];
    }
    return f;
  }

  // p(s(1,f),l)
  function link(t) {
    function f(x) {
      if (x.ref!=undefined) {
        return t[x.ref]
      } else {
        return x;
      }
    }
    return f
  }
  l=[];
  p('o=',o)
  a=[s(o,I,unlink(l)),l]
  pj(a)
//  p(s({'ref':0},link(l)))
}

{
  function children(x) {
    if (typeof x == 'string') return [];
    if (typeof x == 'number') return [];
    return x;
  }
  function isarray(x) {
    return x.length != undefined
  }
  function nu(y) {
    if (typeof y == 'string') return y
    if (typeof y == 'number') return y
    if (isarray(y)) return []
    return {}
  }

  function save(x, linkix, links) {
    function dfs(x, seen, r) {
      if (!(x in seen)) {
        seen[x] = r.length
        var nux=nu(x)
        r.push(nux)
        var y
        for (y in children(x)) {
          nux[y]=dfs(x[y],seen,r)
        }
      }
      return {'ref': seen[x]}
    }
    dfs(x, linkix, links)
    return dfs(x, linkix, links)
  }
  function restore() {
  }
  print()
  print('o=',o)
  print()
  var linkix={}, links=[]
  print('save=',save(o,linkix,links))
  print('links=',links)
  var l=[1,2]
  l[0]=l
  print('save=',save(l,linkix,links))
  print('links=',links)
}
    

