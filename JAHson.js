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
    this.keys=[]
    this.vals=[]
  }

  Dict.prototype.ij=function(k) {
    var i=this.ix[k], j=0;
    if (i==undefined) {
      i=this.ix[k]=this.keys.push([k])-1
      j=0;
    } else {
      var ks=this.keys[i]
      j=ks.indexOf(k)
      if (j<0) {
        j=ks.push(k)-1
      }
    }
    return [i,j]
  }
  Dict.prototype.set=function(k,v) {
    var ij = this.ij(k)
    var i = ij[0], j=ij[1];
    var vi = this.vals[i]
    if(vi==undefined) vi=this.vals[i]=[]
    this.vals[i][j]=v
  }
  Dict.prototype.get=function(k) {
    var ij = this.ij(k)
    var i = ij[0], j=ij[1];
    return this.vals[i] && this.vals[i][j]
  }

  function test() {
    var d=new Dict()
    var x0=0,x1=2,x2='a2',x3=[],x4=[],x5={a:'a'},x6={a:'b'},x7={a:x7},x8={a:x6}
    var assert= { equal: function (x,y) { console.assert(x==y); } }
    d.set(x0,0)
    d.set(x1,1)
    d.set(x2,2)
    d.set(x3,3)
    d.set(x4,4)
    d.set(x5,5)
    d.set(x6,6)
    d.set(x7,7)
    d.set(x8,8)
    assert.equal(d.get(x0),0)
    assert.equal(d.get(x1),1)
    assert.equal(d.get(x2),2)
    assert.equal(d.get(x3),3)
    assert.equal(d.get(x4),4)
    assert.equal(d.get(x5),5)
    assert.equal(d.get(x6),6)
    assert.equal(d.get(x7),7)
    assert.equal(d.get(x8),8)
  }
  test()
}
{
  function save(x, links, linkix) {
    if (!linkix) {
      linkix=new Dict()
      var k; for(k in links) {
        v=links[k]
        linkix.set(v,k)
      }
    }
    var id=1
    function dfs(y,seen,many) {
      if (!seen.has(y)) {
        var nuy;
        seen.set(y,nuy=this.nu(y))
        for(x in this.children(y)) {
          nuy[x]=dfs(y[x],seen,many)
        }
        return nuy
      }
      var r={'@': id++}
      many.set(r,seen[y])
      return {'@': seen[y]}
    }
    seen=new Dict()
    many=new Dict()
    dfs(x,seen,many)
    
    return dfs(x, linkix)
  }
}




  

print=p=console.log;
o1={a:[1,2,3], b:'12xx', c: {ref:'b'}}
print()
print('o=',o1)
print()
var linkix={}, links=[]
print('save=',s1=JAHson.save(o1,linkix,links))
print('links=',links)
var o2=[1,2]
o2[1]=o2
print(o2)
print('save=',s2=JAHson.save(o2,linkix,links))
print('links=',links)
print()
print('restore=',JAHson.restore(s1,links))
print('restore=',JAHson.restore(s2,links))
print('restore=',JAHson.restore([s1, {'a':2, 'ref': s2}],links))

