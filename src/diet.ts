import { Quest, Task } from "grimoire-kolmafia";
import {
  drink,
  eat,
  inebrietyLimit,
  myAdventures,
  myFamiliar,
  myFullness,
  myInebriety,
  retrieveItem,
  use,
} from "kolmafia";
import {
  $familiar,
  $item,
  get,
  getRemainingLiver,
  getRemainingSpleen,
  getRemainingStomach,
  have,
  withProperty,
} from "libram";
import { args, cliExecuteThrow, external, halloween, willAscend } from "./util";

const shouldNightcap = () => getRemainingLiver() === 0 && myFamiliar() === $familiar`Stooper`;

const OVERDRUNK_VOA = 4000;
const HALLOWEEN_MPA = 15000;

function primaryDietTasks() {
  if (halloween()) {
    return [
      {
        name: "halloween consume",
        completed: () =>
          getRemainingStomach() === 0 && getRemainingLiver() === 0 && getRemainingSpleen() === 0,
        do: () => withProperty("valueOfAdventure", HALLOWEEN_MPA, () => external("consume", "ALL")),
      },
      {
        name: "halloween nightcap ascend",
        ready: () => shouldNightcap() && willAscend(),
        completed: () => myInebriety() > inebrietyLimit(),
        do: () =>
          withProperty("valueOfAdventure", HALLOWEEN_MPA, () => external("consume", "NIGHTCAP")),
      },
      {
        name: "halloween nightcap",
        ready: () => shouldNightcap() && !willAscend(),
        completed: () => myInebriety() > inebrietyLimit(),
        do: () => external("consume", "NIGHTCAP"),
      },
    ];
  } else {
    return [
      {
        name: "nightcap ascend",
        ready: () => shouldNightcap() && willAscend(),
        completed: () => myInebriety() > inebrietyLimit(),
        do: () =>
          withProperty("valueOfAdventure", OVERDRUNK_VOA, () => external("consume", "NIGHTCAP")),
      },
      {
        name: "nightcap",
        ready: () => shouldNightcap() && !willAscend(),
        completed: () => myInebriety() > inebrietyLimit(),
        do: () => external("consume", "NIGHTCAP"),
      },
    ];
  }
}

export const diet: Quest<Task> = {
  name: "diet",
  tasks: [
    {
      name: "burnsger",
      ready: () =>
        args.batfellow &&
        have($item`Mr. Burnsger`) &&
        myInebriety() >= 2 &&
        getRemainingStomach() >= 4,
      completed: () => get("_mrBurnsgerEaten"),
      prepare: (): void => {
        if (!get("_milkOfMagnesiumUsed")) {
          retrieveItem($item`milk of magnesium`);
          use($item`milk of magnesium`);
        }
      },
      do: () => eat($item`Mr. Burnsger`),
    },
    {
      name: "doc clock",
      ready: () =>
        args.batfellow &&
        have($item`Doc Clock's thyme cocktail`) &&
        myFullness() >= 2 &&
        getRemainingLiver() >= 4,
      completed: () => get("_docClocksThymeCocktailDrunk"),
      do: () => drink($item`Doc Clock's thyme cocktail`),
    },
    {
      name: "mad liquor",
      ready: () =>
        args.batfellow &&
        have($item`The Mad Liquor`) &&
        myFullness() >= 1 &&
        getRemainingLiver() >= 3,
      completed: () => get("_madLiquorDrunk"),
      do: () => drink($item`The Mad Liquor`),
    },
    {
      name: "stooper",
      ready: () =>
        myAdventures() === 0 && getRemainingLiver() === 0 && myFamiliar() !== $familiar`Stooper`,
      completed: () => getRemainingLiver() === 0 && myFamiliar() === $familiar`Stooper`,
      do: () => cliExecuteThrow("drink stillsuit distillate"),
      outfit: { familiar: $familiar`Stooper` },
    },
    ...primaryDietTasks(),
  ],
};
