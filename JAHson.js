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
/* {
  function save(x, links, linkix) {
    def addlink(x) {
      var r=linkix[x];
      if (r==undefined) {
        return linkix[x]=links.push(x)-1;
      } else if (r.indexOf) {
        var i,j; j=r.indexOf(x)
        if (j<0) {
          j=links.push(x)-1
          r.push(j);
        }
        return j
      } else {
        if(links[r]==x) return r;
        linkix[r]=[links[r],x];
        assert.ok(linkix[r].indexOf)
        return links.push(x)-1
      }
    }
    def addix(k,x) {
      var r=linkix[x]
      if (k==r) return;
      if (r==undefined) {
        linkix[x]=k
      } else if (r.indexOf) {
        r.push

        :x



      

    if (!linkix) {
      linkix={}
      var k; for(k in links) {
        var v=links[k];
        var r=linkix[v]
        if (r!=undefined) {
          if (r.indexOf) {
            r.push(k);
          } else {
            

          
      if (k in linkix) {
        
      if (k.length) {
        var i; for(i in k)
*/
{
  function Dict() {
    this.ix={}
    this.keys=[]
    this.vals=[]
  }

  Dict.prototype.set=function(k,v) {
    var i=this.ix[k];
    if (i==undefined) {
      i=this.ix[k]=this.keys.push([k])-1
      this.vals[i]=[v]
      return
    } else {
      var ks=this.keys[i]
      var j=ks.indexOf(k)
      if (j<0) {
        j=ks.push(k)-1
      }
      this.vals[i][j]=v
    }
  }
  Dict.prototype.has=function(k) {
    var i=this.ix[k];
    return i!=undefined && !(this.keys[i].indexOf(k)<0)
  }
  Dict.prototype.get=function(k) {
    var i=this.ix[k], j=0;
    if (i!=undefined) {
      var j=this.keys[i].indexOf(k);
      if (!(j<0)) {
        return this.vals[i][j]
      }
    }
  }

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
  }
  test()
}
{
  function save(x, links, linkix) {
    if (!linkix) {
      linkix=new Dict()
      var k; for(k in links) { v=links[k]; linkix.set(v,k); }
    }
    /* ... */
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

