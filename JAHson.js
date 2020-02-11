var JAHson;

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

