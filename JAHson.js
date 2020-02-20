var JAHson;
print=p=console.log;

{
  function rebuild(y) { return y }
  function atom(y) {
    return y==undefined || typeof y == 'string' || typeof y == 'number'
  }
  function children(x) {
    if (atom(x)) return [];
    return x;
  }
  function isarray(y) {
    if(y.length == undefined) return false;
    var x,i=0;
    for(x in y) {
      if (x!=i) return false;
      i+=1;
    }
    return true;
  }
  function nu(y) {
    if (atom(y)) return y;
    if (isarray(y)) return [];
    return {};
  }
  function save(x, links, linkix) {
    var k;
    if (!linkix) for(k in links) linkix[links[k]]=k;
    function dfs(y, seen, r) {
      if (!(y in seen)) {
        seen[y] = r.length;
        var nuy=this.nu(y);
        r.push(nuy);
        var x;
        for (x in this.children(y)) {
          nuy[x]=dfs(y[x],seen,r);
        }
      }
      return {'ref': seen[y]};
    }
    dfs(x, links, linkix);
    return dfs(x, links, linkix);
  }
  function restore(root,links) {
    var nulinks=[];
    function dfs(y, links) {
      var nuy;
      var r=y.ref;
      if (r != undefined) {
        y=r
        if (r in nulinks)
          return nulinks[r];
        else if (r in links) {
          y=links[r]
          nuy=nulinks[r]=this.nu(y);
        } else {
          return r
        }
      } else {
        nuy=this.nu(y);
      }
      for (x in this.children(y)) {
        nuy[x]=dfs(y[x],links)
      }
      return this.rebuild(nuy)
    }
    return dfs(root,links);
  }
      
  JAHson={
    save:save, restore:restore, children:children, 
    nu:nu, atom:atom, isarray:isarray
  }
}
{
  function Dict() {
    this.ix={}
    this.ks=[]
    this.vs=[]
  }

  Dict.prototype.set=function(k,v) {
    var i=this.ix[k];
    if (i==undefined) {
      i=this.ix[k]=this.ks.push([k])-1
      this.vs[i]=[v]
      return
    } else {
      var ks=this.ks[i]
      var j=ks.indexOf(k)
      if (j<0) {
        j=ks.push(k)-1
      }
      this.vs[i][j]=v
    }
  }
  Dict.prototype.has=function(k) {
    var i=this.ix[k];
    return i!=undefined && !(this.ks[i].indexOf(k)<0)
  }
  Dict.prototype.get=function(k) {
    var i=this.ix[k], j=0;
    if (i!=undefined) {
      var j=this.ks[i].indexOf(k);
      if (!(j<0)) {
        return this.vs[i][j]
      }
    }
  }
  function flatten(a) {
    for(var i=0,r=[]; i<a.length; i++)
      for(var j=0,b=a[i]; j<b.length; j++)
        r.push(b[j]);
    return r;
  }
  Dict.prototype.keys=function() { return flatten(this.ks); }
  Dict.prototype.vals=function() { return flatten(this.vs); }

  function test() {
    var d=new Dict()
    var x0=0,x1=2,x2='a2',x3=[],x4=[],x5={a:'a'},x6={a:'b'},x7={a:x7},x8={a:x6}
    var assert= console.assert;
    d.set(x0,0)
    assert(d.has(x0))
    assert(!d.has(x1))
    d.set(x1,1)
    d.set(x2,2)
    assert(!d.has(x3))
    d.set(x3,3)
    assert(d.has(x3))
    assert(!d.has(x4))
    d.set(x4,4)
    d.set(x5,5)
    d.set(x6,6)
    d.set(x7,7)
    d.set(x8,8)
    assert(d.get(x0)==0)
    assert(d.get(x1)==1)
    assert(d.get(x2)==2)
    assert(d.get(x3)==3)
    assert(d.get(x4)==4)
    assert(d.get(x5)==5)
    assert(d.get(x6)==6)
    assert(d.get(x7)==7)
    assert(d.get(x8)==8)
    print('keys=',d.keys())
    print('vals=',d.vals())
    assert(d.keys()[7]==x7)
    assert(d.vals()[7]==7)
  }
  test()
}
{
  function Dict() {
    this.ks=[]
    this.vs=[]
  }

  Dict.prototype.set=function(k,v) {
    var j=this.ks.indexOf(k);
    if (!(j<0)) {
      this.ks[j]=v
    } else {
      this.ks.push(k)
      this.vs.push(v)
    }
  }
  Dict.prototype.has=function(k) {
    return !(this.ks.indexOf(k)<0)
  }
  Dict.prototype.get=function(k) {
    var j=this.ks.indexOf(k)
    if (!(j<0)) return this.vs[j]
  }
  Dict.prototype.keys=function() { return this.ks; }
  Dict.prototype.vals=function() { return this.vs; }

  function test() {
    var d=new Dict()
    var x0=0,x1=2,x2='a2',x3=[],x4=[],x5={a:'a'},x6={a:'b'},x7={a:x7},x8={a:x6}
    var assert= console.assert;
    d.set(x0,0)
    assert(d.has(x0))
    assert(!d.has(x1))
    d.set(x1,1)
    d.set(x2,2)
    assert(!d.has(x3))
    d.set(x3,3)
    assert(d.has(x3))
    assert(!d.has(x4))
    d.set(x4,4)
    d.set(x5,5)
    d.set(x6,6)
    d.set(x7,7)
    d.set(x8,8)
    assert(d.get(x0)==0)
    assert(d.get(x1)==1)
    assert(d.get(x2)==2)
    assert(d.get(x3)==3)
    assert(d.get(x4)==4)
    assert(d.get(x5)==5)
    assert(d.get(x6)==6)
    assert(d.get(x7)==7)
    assert(d.get(x8)==8)
    assert(d.keys()[7]==x7)
    assert(d.vals()[7]==7)
  }
  test()
}
{
  function save(x, links) {
    var id=0
    function dfs(y,fwd,refs,links) {
      if (fwd.has(y)) {
        var nuy=fwd.get(y)
        return {'@': refs.get(nuy)}
      }
      var nuy=this.nu(y)
      fwd.set(y,nuy)
      refs.set(nuy,id)
      links[id++]=nuy
      for(var x in this.children(y)) {
        nuy[x]=dfs(y[x],fwd,refs,links)
      }
      return {'@': refs.get(nuy)}
    }
    var fwd=new Dict()
    var refs=new Dict()
    id=links.length
    return dfs(x,fwd,refs,links)
  }
  function restore(x, links, nulinks) {
    function dfs(y, links, nulinks, ref) {
      if (y==undefined) return y;
      var ref=y['@']
      if (ref==undefined) {
        var nuy=this.nu(y)
        if(ref!=undefined) nulinks[ref]=nuy
        for(var x in this.children(y)) {
          nuy[x]=dfs(y[x], links, nulinks)
        }
        return this.rebuild(nuy)
      } else {
        var ry=nulinks[ref]
        if (ry==undefined) {
          var y=links[ref]
          ry=nulinks[ref]=this.nu(y)
          for(var x in this.children(y)) {
            ry[x]=dfs(y[x], links, nulinks)
          }
        }
        return ry;
      }
    }
    var nulinks=nulinks || []
    return dfs(x, links, nulinks)
  }

  JAHson.save=save
  JAHson.restore=restore
}




  

print=p=console.log;
o1={a:[1,2,3], b:'12xx', c: {ref:'b'}, d:'12xx'}
print()
print('o1=',o1)
print()
var links=[]
print('save=s1=',s1=JAHson.save(o1,links))
print('links=',links)
var o2=[1,2]
o2[1]=o2
print('o2=',o2)
print('save=s2=',s2=JAHson.save(o2,links))
print('links=',links)
print()
print('restore(s1)=',JAHson.restore(s1,links))
print('restore(s2)=',JAHson.restore(s2,links))
print('restore=',JAHson.restore([s1, {'a':2, 'ref': s2}],links))

