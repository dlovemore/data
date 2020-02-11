class Ref:
    def __init__(self, r, uid):
        self.refmaker = r
        self.uid = uid
    def __matmul__(self, rhs):
        if self in self.refmaker.rees:
            raise RuntimeError
        self.refmaker.rees[self]=rhs
        return rhs
    def __repr__(self):
        return f'{self.uid}@R'

def I(x):
    "Identity function"
    return x

class RefMaker:
    def __init__(self, f=I, Ref=Ref):
        self.refs = dict() # uid->ref
        self.rees = dict() # ref->referee
        self.Ref=Ref
        self.f=f
    def __contains__(self, k):
        return self.f(k) in self.refs
    def __getitem__(self, k):
        return self.rees[k]
    def __rmatmul__(self, x):
        "Handles uid@self"
        uid=self.f(x)
        if uid not in self.refs:
            self.refs[uid] = self.Ref(self,uid)
        return self.refs[uid]

def compose(f,g):
    def compose(*args):
        nonlocal f,g
        return g(f(*args))
    return compose
# >>> from save import compose
# >>> import auto
# >>> rl=compose(len,range)
# >>> rl([10,20,30])
# range(0, 3)
# >>> f=compose(rl,list)
# >>> f([10,20,30])
# [0, 1, 2]
# >>> f
# <function compose.<locals>.compose at 0xb6614390>

class Renumberer:
    def __init__(self,start=1):
        self.uids=dict() # id -> new uid
        self.uidn=start
    def __call__(self, id):
        if id not in self.uids:
            self.uids[id]=self.uidn
            self.uidn+=1
        return self.uids[id]
# >>> from save import *
# >>> r=Renumberer()
# >>> r(10)
# 1
# >>> r(20)
# 2
# >>> r(15)
# 3
# >>> r(10),r(15),r(20),r(25)
# (1, 3, 2, 4)
# >>> r(10),r(15),r(20),r(25)
# (1, 3, 2, 4)
# >>> r(1)
# 5
# >>> RR=RefMaker(f=compose(id,Renumberer()))
# >>> 5@RR
# 1@R
# >>> 5@RR
# 1@R
# >>> 5@RR@'s'
# 's'
# >>> 5@RR
# 1@R
# >>> _ in RR, RR[_]
# (False, 's')
# >>> 
#

# compose(id,Renumberer())

def children(x):
    if isinstance(x, list) or isinstance(x,tuple) or isinstance(x, set):
        yield from x
    elif isinstance(x, dict):
        yield from list(x.items())

def haschildren(x):
    if isinstance(x, list) or isinstance(x,tuple) or isinstance(x, set):
        return True
    elif isinstance(x, dict):
        return True
    return False

def immutable(x):
    return isinstance(x, tuple)

def dfs(y,f,g=None):
    R=RefMaker(id)
    todo=[y]
    while todo:
        x=todo.pop(0)
        if x not in R:
            x@R
            yield f(x)
            todo+=list(children(x))
        else:
            if g: yield g(x)
# >>> R=RefMaker(id)
# >>> 'x'@R
# 3061029472@R
# >>> 'x' in R
# True
# >>> force([1,2,3])
# [1, 2, 3]
# >>> 1 in R
# False
# >>> 1@R
# 4407700@R
# >>> 1 in R
# True
# >>> 
# >>> force(dfs([1,2,3,4,2],I))
# [[1, 2, 3, 4, 2], 1, 2, 3, 4]
# >>> 'x'@R
# 3061029472@R
# >>> R.refs
# {3061029472: 3061029472@R, 4407700: 4407700@R}
# >>> 


def force(x):
    "Force evaluation of generator"
    return list(x)

def saveflat(x):
    seen=set()
    many=set()
    R=RefMaker(id)
    S=RefMaker(id)
    def note(x):
        x@R@x
    def many(x):
        x@S
    force(dfs(x,note,many))
    def prref(x):
        return repr(x@R)
    def pr(x):
        s=prref(x)+'@'
        if haschildren(x):
            s+=f'{type(x).__name__}(['
            rf = pr if immutable(x) else prref
            s+=','.join(map(rf,children(x)))
            s+='])'
        else:
            s+=repr(x)
        return s
    return list(dfs(x,pr))

def save(x):
    R=RefMaker(id)
    S=RefMaker(id)
    def note(x):
        x@R@x
    def many(x):
        x@S
    force(dfs(x,note,many))
    def prref(x):
        return repr(x@R)
    def pr(x):
        s=prref(x)+'@' if id in S else ''
        if haschildren(x):
            s+=f'{type(x).__name__}(['
            rf = pr if immutable(x) else prref
            s+=','.join(map(rf,children(x)))
            s+='])'
        else:
            s+=repr(x)
        return s
    return list(dfs(x,pr))
    uid=None
    def pr(x):
        nonlocal uid
        s=''
        if id(x) in many:
            if id(x) in uids:
                return f'{uids[id(x)]}@R'
            else:
                uids[id(x)]=uid
                # uids[id(x)]=id(x)
                s+=f'{uids[id(x)]}@R@'
                uid+=1
        if haschildren(x):
            first=True
            s+=f'{type(x).__name__}(['
            for child in children(x):
                if first: first=False
                else: s+=','
                s+=pr(child)
            s+='])'
        else:
            s+=repr(x)
        return s
    return pr(x)

def load(s):
    global R
    R=RefMaker()
    b=eval(s)
    seen=set()
    def resolve(x):
        if id(x) not in seen:
            if isinstance(x, tuple):
                return type(x)([resolve(c) for c in children(x)])
            seen.add(id(x))
            if isinstance(x, list):
                x[:]=[resolve(c) for c in children(x)]
            elif isinstance(x, dict) or isinstance(x, set):
                l=[resolve(c) for c in children(x)]
                x.clear()
                x.update(l)
            elif haschildren(x):
                return ('error',x)
        if isinstance(x, Ref):
            return R.rees[x]
        else:
            return x
    return resolve(b)

# >>> from save import *
# >>> # save/load
# >>> 
# >>> R=RefMaker()
# >>> R.__rmatmul__(11)
# 11@R
# >>> Ref(R,11)
# 11@R
# >>> 
# >>> 1@R
# 1@R
# >>> 1@R@37
# 37
# >>> R.rees[1@R]
# 37
# >>> 
# >>> 
# >>> 2@R==2@R
# True
# >>> 2@R==1@R
# False
# >>> [1]==[1]
# True
# >>> [1,2]==[1,2]
# True
# >>> [1,2] is [1,2]
# False
# >>> 1@R is 1@R
# True
# >>> {1@R,1@R}
# {1@R}
# >>> {1@R,2@R}
# {2@R, 1@R}
# >>> l=[[1,2,3],[4,5,6]]
# >>> save(l)
# 'list([list([1,2,3]),list([4,5,6])])'
# >>> load(_)
# [[1, 2, 3], [4, 5, 6]]
# >>> l2=[l,l]
# >>> l2
# [[[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]]]
# >>> save(l2)
# 'list([1@R@list([list([1,2,3]),list([4,5,6])]),1@R])'
# >>> load(_)
# [[[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]]]
# >>> save(_)
# 'list([1@R@list([list([1,2,3]),list([4,5,6])]),1@R])'
# >>> load(_)
# [[[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]]]
# >>> tuple(_)
# ([[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]])
# >>> save(_)
# 'tuple([1@R@list([list([1,2,3]),list([4,5,6])]),1@R])'
# >>> load(_)
# ([[1, 2, 3], [4, 5, 6]], [[1, 2, 3], [4, 5, 6]])
# >>> _[0][0][1]=-2
# >>> _
# ([[1, -2, 3], [4, 5, 6]], [[1, -2, 3], [4, 5, 6]])
# >>> save(_)
# 'tuple([1@R@list([list([1,-2,3]),list([4,5,6])]),1@R])'
# >>> load(_)
# ([[1, -2, 3], [4, 5, 6]], [[1, -2, 3], [4, 5, 6]])
# >>> print(saveflat(_))
# ['3058829952@R@tuple([3058885536@R@list([3058885376@R,3058885656@R]),3058885536@R@list([3058885376@R,3058885656@R])])', '3058885536@R@list([3058885376@R,3058885656@R])', '3058885376@R@list([4407700@R,4407652@R,4407732@R])', '3058885656@R@list([4407748@R,4407764@R,4407780@R])', '4407700@R@1', '4407652@R@-2', '4407732@R@3', '4407748@R@4', '4407764@R@5', '4407780@R@6']
# >>> 
# >>> 
# >>> dict([(1,2)])
# {1: 2}
# >>> 
# >>> save(0)
# '0'
# >>> save([])
# 'list([])'
# >>> save({1,2,3,'x'})
# "set(['x',1,2,3])"
# >>> load(_)
# {2, 1, 'x', 3}
# >>> d={i:[10+i] for i in range(10)}
# >>> d
# {0: [10], 1: [11], 2: [12], 3: [13], 4: [14], 5: [15], 6: [16], 7: [17], 8: [18], 9: [19]}
# >>> d[0]=d[7]
# >>> d
# {0: [17], 1: [11], 2: [12], 3: [13], 4: [14], 5: [15], 6: [16], 7: [17], 8: [18], 9: [19]}
# >>> save(_)
# 'dict([tuple([0,1@R@list([17])]),tuple([1,list([11])]),tuple([2,list([12])]),tuple([3,list([13])]),tuple([4,list([14])]),tuple([5,list([15])]),tuple([6,list([16])]),tuple([7,1@R]),tuple([8,list([18])]),tuple([9,list([19])])])'
# >>> load(_)
# {0: [17], 1: [11], 2: [12], 3: [13], 4: [14], 5: [15], 6: [16], 7: [17], 8: [18], 9: [19]}
# >>> d[0][0]=-7
# >>> d
# {0: [-7], 1: [11], 2: [12], 3: [13], 4: [14], 5: [15], 6: [16], 7: [-7], 8: [18], 9: [19]}
# >>> l=[0,0]
# >>> l[0]=l
# >>> l
# [[...], 0]
# >>> save(_)
# '1@R@list([1@R,0])'
# >>> load(_)
# [[...], 0]
# >>> 
# >>> 
