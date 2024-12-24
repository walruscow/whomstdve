"use strict";

class WowClass {
  static BASE_TALENTS_URL = "https://www.wowhead.com/classic/talent-calc";
  constructor({
    name,
    imageUrl,
    specs,
    builds,
    races
  }) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.specs = specs;
    this.builds = builds;
    this.races = races;
  }
  get talentsUrl() {
    return `${WowClass.BASE_TALENTS_URL}/${this.name.toLowerCase()}`;
  }
}
class Spec {
  constructor({
    name,
    imageUrl,
    description,
    talentsUrl
  }) {
    this.name = name;
    this.imageUrl = imageUrl;
  }
}
class Build {
  constructor({
    name,
    imageUrl,
    description,
    rules,
    talentsUrl,
    talentsDescription
  }) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.description = description;
    this.rules = rules;
    this.talentsUrl = talentsUrl;
    this.talentsDescription = talentsDescription;
  }
}
const DRUID_BUILDS = [new Build({
  name: "Laser Chicken",
  imageUrl: null,
  description: "Moonkin",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/druid/5123500000051351",
  talentsDescription: "",
  rules: "Moonkin mode!"
}), new Build({
  name: "Furry",
  imageUrl: null,
  description: "Cat form",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/druid/014005001-0502321203",
  talentsDescription: "Feral -> Omen -> Shifting",
  rules: "Prioritize being in cat/bear forms"
}), new Build({
  name: "Bonk",
  imageUrl: null,
  description: "Bonk your enemies until they give up",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/druid/0143553310500001-05005-05",
  talentsDescription: "Imp Thorns -> Thick Hide -> Furor -> Chicken",
  rules: "Prioritize melee damage, not in cat/bear"
})];
const HUNTER_BUILDS = [new Build({
  name: "Pokemon",
  imageUrl: null,
  description: "Rely on pets. Can you use Eyes of the Beast to play the game?",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/hunter/0500320140521251",
  talentsDescription: "",
  rules: "First 31 into BM. Fists + pets only?"
}), new Build({
  name: "MM Hunter",
  imageUrl: null,
  description: "Snipe your enemies from afar",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/hunter/-50051500513051",
  talentsDescription: "",
  rules: "First 31 into MM"
}), new Build({
  name: "Surv Hunter",
  imageUrl: null,
  description: "Use melee combat and traps to confuse and defeat your enemies",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/hunter/--0053202212323141/2CEdddGhjhMNqPKrrrrs",
  talentsDescription: "",
  rules: "First 31 into Surv"
})];
const MAGE_BUILDS = [new Build({
  name: "War Mage",
  imageUrl: null,
  description: "Adept with both sword and spell",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/mage/0500502312201-05003-202/1BE2Acc0BEjGhhKhMp",
  talentsDescription: "Mana Shield + POM or Shatter + Ice Barrier",
  rules: "Prioritize melee damage and instant spells. One pre cast might be ok."
}), new Build({
  name: "Pyromaniac",
  imageUrl: null,
  description: "Make the world burn",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/mage/-5502320120013151-003/1ABhJFEDqPnRs2C",
  talentsDescription: "All fire all the way. Dip into Ele Precision",
  rules: "Only Fire damage spells. Utility ok."
}), new Build({
  name: "Scholar",
  imageUrl: null,
  description: "A scholar of magic, use the arcane arts to annihilate your enemies",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/mage/0350052012031531/0CbbbffGjffKNpqqqqRqfs",
  talentsDescription: "31 points into Arcane",
  rules: "Arcane damage only. Utility ok."
})];
const PALADIN_BUILDS = [new Build({
  name: "Holy Shock",
  imageUrl: null,
  description: "Smite your enemies with the power of the light!",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/paladin/55050120501331",
  talentsDescription: "Holy Shock",
  rules: "First 31 into Holy"
}), new Build({
  name: "Ret",
  imageUrl: null,
  description: "",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/paladin/--532300512003151",
  talentsDescription: "",
  rules: ""
}), new Build({
  name: "Justicar",
  imageUrl: null,
  description: "An eye for an eye is your motto. Attackers take damage.",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/paladin/-053221035301051-05235000022",
  talentsDescription: "",
  rules: "Melee and instant damage spells only. Can heal in melee."
})];
const PRIEST_BUILDS = [new Build({
  name: "Shadowform",
  imageUrl: null,
  description: "An agent of chaos, you act in service of the old gods",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/priest/--5500325000111251",
  talentsDescription: "Shadowform",
  rules: "First 31 into Shadow"
}), new Build({
  name: "Holy Fire",
  imageUrl: null,
  description: "Smite your enemies in the name of the light",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/priest/05023013-03505030202005-5",
  talentsDescription: "Spirit Guidance -> Spirit Tap -> Inner Focus",
  rules: "No shadow magic!"
}), new Build({
  name: "War Priest",
  imageUrl: null,
  description: "On the front lines of combat, you support your allies and conquer your enemies",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/priest/500232123-23-5",
  talentsDescription: "",
  rules: "Melee and instant damage spells only. Can heal in melee."
})];
const ROGUE_BUILDS = [new Build({
  name: "Ambusher",
  imageUrl: null,
  description: "Ambush your enemies, and end the fight before it starts",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/rogue/025--05005203",
  talentsDescription: "Remorseless -> Imp Ambush",
  rules: "Prioritize ambush and backstab"
}), new Build({
  name: "Thief",
  imageUrl: null,
  description: "Use stuns, bleeds and poisons to safely dispatch your opponents",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/rogue/0053201--05024310230012",
  talentsDescription: "Prep -> DD -> Relentless Strikes",
  rules: ""
}), new Build({
  name: "Batman",
  imageUrl: null,
  description: "Beat up the bad guys with your fists",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/rogue/-00505501000401052-0522101",
  talentsDescription: "Fist weapons -> Ghostly Strike",
  rules: "Use only unarmed / fist weapons"
})];
const SHAMAN_BUILDS = [new Build({
  name: "Ele Shaman",
  imageUrl: null,
  description: "Destroy your enemies with lightning",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/shaman/550001350302151",
  talentsDescription: "Dual spec to resto",
  rules: "First 31 into Ele"
}), new Build({
  name: "2H Enh",
  imageUrl: null,
  description: "Like Thor, you wield a mighty weapon and harness the power of the storm",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/shaman/-5005231105003051",
  talentsDescription: "",
  rules: "First 31 into Enh"
}), new Build({
  name: "Shaman Tank",
  imageUrl: null,
  description: "Shielded by the earth",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/shaman/2500305-05202100505031",
  talentsDescription: "Parry -> Improved Shocks / Ele Weapon -> Elemental Focus -> Eye of the Storm",
  rules: "Use a shield. Try to tank dungeons."
})];
const WARLOCK_BUILDS = [new Build({
  name: "Melee Warlock",
  imageUrl: null,
  description: "Not the best with a sword, but will still kill you thanks to a pact with a demon",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warlock/55301000102-13503501020512/1BCffhfffeKeeapQ0BC1N0aajaaaeM",
  talentsDescription: "Demonic Sac -> Imp Weakness -> Subj / Firestone / Nightfall",
  rules: "Prioritize instant cast spells. Can apply dots before melee."
}), new Build({
  name: "Fire Plane",
  imageUrl: null,
  description: "Hurl fire to destroy your enemies",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warlock/--0550205120025121/2BChEggJgggqNPrrs",
  talentsDescription: "Conflag -> Imp Imp -> Fel Int / Destro / Master Summoner",
  rules: "Prioritize Fire spells like Soul Fire, Immolate, Searing Pain. Prioritize using Imp as your demon."
}), new Build({
  name: "Lich",
  imageUrl: null,
  description: "Drain the life from your enemies",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warlock/2500250510001/0BaafffHffjpE",
  talentsDescription: "SL -> DP or Sac",
  rules: "Spam Drain Life and dots. Pet should be on passive."
})];
const WARRIOR_BUILDS = [new Build({
  name: "Tactician",
  imageUrl: null,
  description: "Control the battlefield with different stances, shouts and utility",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warrior/05005021-55000105-05215103030001/0BEhG2BeeeCfHeKedq1AfBH",
  talentsDescription: "Arms -> Prot -> Arms or Fury",
  rules: "Use a 2H weapon"
}), new Build({
  name: "Sword and Board",
  imageUrl: null,
  description: "A shield can be a weapon in the right hands",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warrior/05005001--55240123000001251/2ACbbbgH0BEh2gfbbddqRddSt",
  talentsDescription: "Imp Revenge + Double Block -> Arms -> Shield Slam",
  rules: "Use a shield at all times"
}), new Build({
  name: "Berserker",
  imageUrl: null,
  description: "Use two weapons to tear your enemies to pieces in a blood frenzy",
  talentsUrl: "https://www.wowhead.com/classic/talent-calc/warrior/053250213020105011--05240103",
  talentsDescription: "Dual Wield Arms. Mace/Sword spec",
  rules: "Dual Wield only"
})];
const CLASSES = [new WowClass({
  name: "Druid",
  imageUrl: "/images/classes/druid.jpg",
  specs: ["Balance", "Feral", "Restoration"],
  builds: DRUID_BUILDS,
  races: ["Night Elf", "Tauren"]
}), new WowClass({
  name: "Hunter",
  imageUrl: "/images/classes/hunter.jpg",
  specs: ["Beast Mastery", "Marksmanship", "Survival"],
  builds: HUNTER_BUILDS,
  races: ["Dwarf", "Night Elf", "Orc", "Tauren", "Troll"]
}), new WowClass({
  name: "Mage",
  imageUrl: "/images/classes/mage.jpg",
  specs: ["Arcane", "Fire", "Frost"],
  builds: MAGE_BUILDS,
  races: ["Gnome", "Human", "Troll", "Undead"]
}), new WowClass({
  name: "Paladin",
  imageUrl: "/images/classes/paladin.jpg",
  specs: ["Holy", "Protection", "Retribution"],
  builds: PALADIN_BUILDS,
  races: ["Dwarf", "Human"]
}), new WowClass({
  name: "Priest",
  imageUrl: "/images/classes/priest.jpg",
  specs: ["Discipline", "Holy", "Shadow"],
  builds: PRIEST_BUILDS,
  races: ["Dwarf", "Human", "Night Elf", "Troll", "Undead"]
}), new WowClass({
  name: "Rogue",
  imageUrl: "/images/classes/rogue.jpg",
  specs: ["Assassination", "Combat", "Subtlety"],
  builds: ROGUE_BUILDS,
  races: ["Dwarf", "Gnome", "Human", "Night Elf", "Orc", "Troll", "Undead"]
}), new WowClass({
  name: "Shaman",
  imageUrl: "/images/classes/shaman.jpg",
  specs: ["Elemental", "Enhancement", "Restoration"],
  builds: SHAMAN_BUILDS,
  races: ["Orc", "Tauren", "Troll"]
}), new WowClass({
  name: "Warlock",
  imageUrl: "/images/classes/warlock.jpg",
  specs: ["Affliction", "Demonology", "Destruction"],
  builds: WARLOCK_BUILDS,
  races: ["Gnome", "Human", "Orc", "Undead"]
}), new WowClass({
  name: "Warrior",
  imageUrl: "/images/classes/warrior.jpg",
  specs: ["Arms", "Fury", "Protection"],
  builds: WARRIOR_BUILDS,
  races: ["Dwarf", "Gnome", "Human", "Night Elf", "Orc", "Tauren", "Troll", "Undead"]
})];
function BuildDisplay({
  wowClass,
  build,
  race
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "build-display"
  }, /*#__PURE__*/React.createElement("h2", null, wowClass.name), /*#__PURE__*/React.createElement("h3", null, build.name), /*#__PURE__*/React.createElement("p", null, build.description), /*#__PURE__*/React.createElement("p", null, "Race: ", race), /*#__PURE__*/React.createElement("a", {
    href: build.talentsUrl,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "View Talents"), build.rules && /*#__PURE__*/React.createElement("div", {
    className: "rules"
  }, /*#__PURE__*/React.createElement("h4", null, "Rules:"), /*#__PURE__*/React.createElement("p", null, build.rules)));
}
function AppRoot() {
  let total_choices = 0;
  CLASSES.forEach(wc => total_choices += wc.builds.length * wc.races.length);
  console.log(`total choices: ${total_choices}`);
  const chosen_class = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const chosen_build = chosen_class.builds[Math.floor(Math.random() * chosen_class.builds.length)];
  const chosen_race = chosen_class.races[Math.floor(Math.random() * chosen_class.races.length)];
  console.log(`chosen class: ${chosen_class.name}`);
  console.log(`chosen build: ${chosen_build.name} - ${chosen_build.description}`);
  return /*#__PURE__*/React.createElement("div", {
    id: "app"
  }, /*#__PURE__*/React.createElement(BuildDisplay, {
    wowClass: chosen_class,
    build: chosen_build,
    race: chosen_race
  }));
}
ReactDOM.render(/*#__PURE__*/React.createElement(AppRoot, null), document.getElementById("root"));