var user = {
  stats: {
    agi: 0,
    dex: 0
  },
  hp: 0,
  mp: 0,
  stamina: 0,
  loc: '',
  bounty: 100,
  reputation: {

  },
  buffs: [{
    id: 0,
    timeRemain: 5
  }],
  debuffs: {

  },
  skills: [],
  items: {}
};

var objectsDb = {

};

var object = {
  stats: {
    length: 1,
    width: 1,
    z: 1,
    weight: 200,
    pos: [],
    props: {
      material: 'marble'
    }
  },
  timers: {

  },
  triggers: {

  },
  inv: {

  }
};

var objectLists = {
  map: {
    mapName: 'map',
    baseObjectList: {
      a12312: {
        type: {
          class: 'statue',
          material: 'marble',
          hasItem: true,
          mapVisible: true,
          nodeVisible: true,
          interaction: true,
          triggers: true
        }, // terrain obj, item container, non-node obj,
        props: {
          immovable: true,
          breakable: true,
          flammable: true
        },
        stats: {
          length: 1,
          width: 1,
          height: 1,
          weight: [100, 300]
        }
      }
    },
    static: [],
    rand: []
  }
};

var npcLists = {
  map: {
    mapName: 'map',
    randHero: [[3, 10]],  // if length 1 rand, else prob, false if no rand hero
    baseNpcList: {
      a123123: { // npcId
        name: '',
        longName: '',
        class: '',
        combatModule: 1,
        leadership: [50, 20],
        inv: { // separate field
          populate: [['head', [30, 100]], ['neck', [30, 100]]], // or ['head', 'neck'] SHARD FIRST
          generateItems: {
            head: {
              type: 0,  // 0 - worn eq, 1 - mat, 2 - rand, 3 - bag, 4 - shard, 5 - quest
              rand: [[1, 12, [[0,1], [80,2], [30, 3]]], [1, 12, [[0,1], [80,2], [30, 3]]]], // mat, tier, prob
              randFromGroup: [
                [[1, 1], 2, 3],    // need tier info
                [[0, 1], [80, 2]]
              ] // group or prob array w / tier
            },
            neck: false,
            bag: {
              type: 1,
              tier: 12, //randIdorProb
              itemGroup: 'asdf',
              rank: [[1, 2, 3],[[0, 1], [80, 2]]],
              min: 1,
              max: 5
            },
            miscEq: {
              type: 2,
              tier: 12, //randIdorProb
              rank: [[1, 2, 3],[[0, 1], [80, 2]]]
            }, // tier, weight, min, max
            misc: {
              type: 1,
              tier: 12, //randIdorProb
              itemGroup: 'asdf',
              rank: [[1, 2, 3],[[0, 1], [80, 2]]]
            },
            bagMisc: [3, [500, 800], 1, 5],
            shard: { // or false
              type: 4,
              skillPool: [[[0, 0], [5, 234], [5, 123]], []]
            }
          },
          itemDetails: {
            rank: {
              props: [[1, 2, 3],[[0, 1], [80, 2]]],  // or undefined
              stats: [[1, 2, 3],[[0, 1], [80, 2]]]  // or undefined
            },
            head: {
              propPool: [
                [1, 2, 3],
                [[0, 1], [80, 2]]
              ],     // group or prob array
              slots: [[[0, 2], [80, 3]],[[0, 2], [80, 3]]]
            }
          }
        },

        stats: {
          randomize: [[30, 1, 3], [15, 2, 3], {
            base: 30,
            rand: [[0, [1, 3]], [20, [2, 4]]]
          }], // or false
          base: [],  // hp, mp, stamina, agi, dex, vit, int, mdef, def, armor
          stats: []
        },
        props: {
          randomize: false,
          base: {
            normal: [], // or false
            hero: [] // or false
          },
          pool: [],
          normal: [[1,1]],
          hero: [[2,2]]
        },
        clientTriggers: {
          nonCombat: {
            'talk': {
              secure: true,
              code: 2312
            }
          },
          combat: []
        },
        aggro: [
          {
            check: {
              id: 'hasItem 123',
              logic: [{
                type: 'hasItem' // stat, rep, etc
              }]
            },
            result: {
              id: 'isAggro 5',
              logic: [{
                type: 'hasItem' // stat, rep, etc
              }]
            }
          }
        ],
        canHero: true
      }
    },
    static: [{
      canHero: false,
      npcId: '', //npcId or array
      path: {
        initPos: {
          initPos: [0, 1],
          arrayNum: false,
          posNum: 3
        },
        moveTime: '500',
        move: true,
        multi: true,
        pool: [
          [[0, 1], [1, 3]],
          [[0, 2], [1, 4]]
        ],
        path: [],
        pathType: 0
      },
      link: 'link'
    }, 3, 5, [1, 3, 5]],   // first in array is leader
    rand: [
      {
      link: 'link',
      groups: [[3, 10]],  // if length 1 rand, else prob
      pathing: {
        paths: [{
          initPos: [0, 1], // false
          move: true,
          path: [],
          pathType: 0
        }],
        noDouble: false,
        prob: false // or logic
      },
      groupComp: {
        fixed: false, // [[0, 1], [10, 5], [4, 80], [5, 45]];
        logic: {
          num: {
            rand: [1, 20], // or [min, max]
            logic: [[0, 1], [30, 2]]
          },
          pool: [[0, 2], [10, 8], [20, 5], [5, 9]],
          req: [[3, 9]],  // numReq, idReq, false MAKE SURE NO LOOP
          avoid: [[5, 8], [8, 5]], // false
          maxnum: [[5, 2]] // maxNum, idNum, false
        }
      }
      }
    ]
  }
};

//politics systems - settings based
//everyone exists as npc
// real population possible?

// how to create real economy

// library??

// evolves instead of endgame

//mma to death or not

// community submitted responses npc text

// stats req for skills - no req if on shard or eq

// hexagonal columns

// no random tells