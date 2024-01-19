import BlueCards from "../config/cards/blue.json";
import RedCards from "../config/cards/red.json";
import YellowCards from "../config/cards/yellow.json";
import GreyCards from "../config/cards/grey.json";
import GreenCards from "../config/cards/green.json";
import PurpleCards from "../config/cards/purple.json";
import SpecialCards from "../config/cards/special.json";

// icons
import { FaBomb, FaTheaterMasks } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { GiBrain, GiBottleCap, GiThrownKnife } from "react-icons/gi";
import { MdDarkMode } from "react-icons/md";
import { getPlaysetById } from "./playsets";
import { rng } from "./idgen";
import { findIndexCombinations } from "./arrays";

export const CARD_COLOR_ORDER = [
  "blue",
  "red",
  "grey",
  "yellow",
  "green",
  "drunk",
  "dark",
];

export const CARD_COLOR_FILTER_OPTIONS = [
  "blue",
  "red",
  "grey",
  "green",
];

export const CARD_COLOR_NAMES = {
  red: "r",
  blue: "b",
  grey: "g",
  green: "e",
  purple: "p",
  dark: "d",
  yellow: "y",
};

export const CARD_COLORS = {
  red: {
    primary: "#ec1f2b",
    secondary: "#5e1717",
    text: "#ffffff",
    title: "Red Team",
    icon: FaBomb,
  },
  blue: {
    primary: "#4f94ff",
    secondary: "#152aed",
    text: "#ffffff",
    title: "Blue Team",
    icon: AiFillStar,
  },
  grey: {
    primary: "#9e9e9e",
    secondary: "#595959",
    text: "#ffffff",
    title: "Grey Team",
    icon: FaTheaterMasks,
  },
  green: {
    // e = emerald (green)
    primary: "#18ed1c",
    secondary: "#0c5a27",
    text: "#ffffff",
    title: "Green Team",
    icon: GiBrain,
  },
  drunk: {
    primary: "#AA6DFF",
    secondary: "#554180",
    text: "#ffffff",
    title: "???? Team",
    icon: GiBottleCap,
  },
  dark: {
    // d = dark
    primary: "#000000",
    secondary: "#000000",
    text: "#000000",
    title: "Black Team",
    icon: MdDarkMode,
  },
  yellow: {
    primary: "#ffde26",
    secondary: "#664d00",
    text: "#ffffff",
    title: "Yellow Team",
    icon: GiThrownKnife,
  },
};

export function getCardsForPlayset(game_data) {
  var { players, playset, playWithBury } = game_data;

  var { primaries, cards, odd_card, shuffle, default_cards } = playset;

  cards = [...(primaries || []), ...(cards || [])];

  let playingWithDrunk = false;

  if (cards.filter((c) => c?.id === "drunk")[0]) {
    // drunk card gets removed (will be switched with any card later)
    cards = cards.filter((c) => c?.id !== "drunk");
    playingWithDrunk = true;
  }

  const playerLength = players.length;

  var length = playWithBury ? playerLength + 1 : playerLength;

  if (cards.length < length) {
    const n = length - cards.length; // how many cards
    const addodd = n % 2 === 1; // if cards to add is odd

    const rngSeed = rng(0, 1);

    for (let i = 1; i <= n; i++) {
      if (i === n && addodd) {
        // last odd (if odd and odd_card -> add odd_card else -> random blue or red)
        if (odd_card && odd_card !== "") cards = cards = [odd_card, ...cards];
        else
          cards = [
            ...cards,
            getCardFromId(
              (default_cards?.map((c) => c?.id) || ["b000", "r000"])[rng(0, 1)]
            ),
          ];
      } else {
        cards.push(
          getCardFromId(
            i % 2 === rngSeed
              ? default_cards?.[0]?.id || "b000"
              : default_cards?.[1]?.id || "r000"
          )
        );
      }
    }
  } else {
    if (playWithBury && odd_card) cards.push(odd_card);
    else if (length % 2 === 1 && odd_card) cards.push(odd_card);
  }

  if (shuffle) {
    // shuffles in pairs
    var cards = [...cards.sort((a, b) => 0.5 - Math.random())];
  }

  function selectIncludedCardsBasedOnLinks() {
    var includedCards = [];

    for (let i = 0; i < cards?.length; i++) {
      // makes sure all primaries are shuffled in
      let card = cards[i];
      if (card?.primary) includedCards.push(card);
    }

    let unincludedCards = cards.filter((card) =>
      includedCards.filter((ic) => ic?.id === card?.id)?.[0] ? false : true
    );
    let pairedCardsRow = pairUpCards(unincludedCards);

    if (odd_card) pairedCardsRow.push([odd_card]);
    pairedCardsRow.push(
      default_cards || [getCardFromId("b000"), getCardFromId("r000")]
    );

    let targetValue = length - includedCards?.length; // playercount(+bury) - prinaries
    let combinations = findIndexCombinations(
      pairedCardsRow.map((row) => row.length),
      targetValue
    );

    if (combinations?.[0]) {
      let combination = shuffle
        ? combinations[rng(0, combinations?.length - 1)] // selects random combination that totals to targetValue
        : combinations[0];

      for (let i = 0; i < combination.length; i++) {
        // adds cards at indexes of index combination
        const indexOfCardPair = combination[i];
        includedCards = [...includedCards, ...pairedCardsRow[indexOfCardPair]];
      }
      return includedCards;
    }

    return cards;

    // function getUnincludedCards() { // doesn't remove duplicate ids
    //     var unpaired = [...cards];

    //     for (let i = 0; i < includedCards.length; i++) {
    //         unpaired = remove(unpaired, includedCards[i]?.id)
    //     }

    //     return unpaired

    //     function remove(remArr, cardId) {
    //         if (!cardId) return [...remArr]
    //         var arr = [];

    //         for (let i = 0; i < remArr.length; i++) {
    //             let card = remArr[i];
    //             if (card?.id === cardId) {
    //                 return [...arr, ...remArr.slice((remArr.length - (i + 1)) * -1)]
    //             } else {
    //                 arr.push(card)
    //             }
    //         }

    //         return arr;
    //     }

    // }
  }

  if (length < cards.length) {
    cards = selectIncludedCardsBasedOnLinks() || cards;
  }

  var out_cards = [];

  for (let i = 0; i < length; i++) {
    out_cards.push(cards[i]);
  }

  // chooses buried cards
  if (playWithBury) {
    var buriedCard = getBuriedCard(out_cards);

    var removedBuriedCard = false;
    out_cards = out_cards.filter((c, i) => {
      if (removedBuriedCard) return true;
      if (c?.id === buriedCard?.id) {
        removedBuriedCard = true;
        return false;
      }
      return true;
    });
  }

  out_cards = out_cards.sort((a, b) => 0.5 - Math.random());

  if (buriedCard) out_cards.push(buriedCard);

  let soberCard = undefined;

  if (playingWithDrunk) {
    var i = rng(0, out_cards?.length - 1);
    soberCard = out_cards[i];
    out_cards[i] = getCardFromId("drunk");
  }

  return { cards: out_cards.map((c) => c?.id), soberCard: soberCard?.id };

  function getBuriedCard(cards) {
    const nonLinkedCards = cards.filter((c) => {
      if (c?.links?.length > 0) return false;

      let backup_exists = false;
      if (c?.backup_cards?.[0]) {
        for (let i = 0; i < c?.backup_cards?.length; i++) {
          let backup = c?.backup_cards?.[i];
          if (cards.filter((c) => c?.id === backup)?.[0]) backup_exists = true;
        }
      } else backup_exists = true;

      if (!backup_exists) return false;
      return true;
    });

    const rn = rng(0, nonLinkedCards.length - 1);

    return nonLinkedCards[rn];
  }
}

export function getCardFromId(id) {
  let card = null;

  card = BlueCards.filter((c) => c.id == id)[0] || null;
  if (!card) card = RedCards.filter((c) => c.id == id)[0] || card;
  if (!card) card = YellowCards.filter((c) => c.id == id)[0] || card;
  if (!card) card = GreyCards.filter((c) => c.id == id)[0] || card;
  if (!card) card = GreenCards.filter((c) => c.id == id)[0] || card;
  if (!card) card = PurpleCards.filter((c) => c.id == id)[0] || card;
  if (!card) card = SpecialCards.filter((c) => c.id == id)[0] || card;

  if (card)
    card = { ...card, color: getCardColorFromColorName(card?.color_name) };

  return card;
}

export function getCardColorFromId(id) {
  if (!id) return null;
  const card = getCardColorFromId(id);
  return getCardColorFromColorName(card?.color_name);
}

export function getCardColorFromColorName(color_name) {
  if (!color_name) return null;
  return CARD_COLORS[color_name];
}

export function getAllCards() {
  var all = [
    ...BlueCards,
    ...RedCards,
    ...GreyCards,
    ...GreenCards,
    ...PurpleCards,
    ...SpecialCards,
  ];
  all = all.map((c) => ({
    ...c,
    color: getCardColorFromColorName(c?.color_name),
  }));

  return all;
}

export function sortCards(cards, pairRB = false) {
  if (!cards?.[0]?.id) return cards;
  var allSorted = cards.toSorted((a, b) => {
    return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
  });


  
  allSorted = allSorted.toSorted((x, y) => {
    return x.id == "r001" ? -1 : y.id == "r001" ? 1 : 0;
  });
  allSorted = allSorted.toSorted((x, y) => {
    return x.id == "b001" ? -1 : y.id == "b001" ? 1 : 0;
  });
  allSorted = allSorted.toSorted((x, y) => {
    return x.id == "r000" ? -1 : y.id == "r000" ? 1 : 0;
  }); // pushes certain elements to front
  allSorted = allSorted.toSorted((x, y) => {
    return x.id == "b000" ? -1 : y.id == "b000" ? 1 : 0;
  });


  

  for (let i = 0; i < CARD_COLOR_ORDER.length; i++) {
    let colorName = CARD_COLOR_ORDER[i];
    allSorted = allSorted.toSorted((x, y) => {
      return x.color_name === colorName
        ? 1
        : y.color_name === colorName
        ? -1
        : 0;
    });

    
  }

  if (pairRB) {
    allSorted = allSorted.toSorted((a, b) => {
      // Compare by id first

      if (
        !["red", "blue"]?.includes(a?.color_name) &&
        !["red", "blue"]?.includes(b?.color_name)
      )
        return 1;
      const [aId, bId] = [
        a?.id?.replace("r", "")?.replace("b", ""),
        b?.id?.replace("r", "")?.replace("b", ""),
      ];
      if (aId < bId) return -1;
      if (aId > bId) return 1;

      // If names are equal, maintain the original order
      return 0;
    });
  }

  return allSorted;
}

export function getLinkedCards(card) {
  if (!card?.links) return [];
  var lc = card?.links?.map((cid) => getCardFromId(cid));
  var opposite = ["r", "b"].includes(card.id[0])
    ? getCardFromId(`${card.id[0] === "r" ? "b" : "r"}${card.id.slice(-3)}`)
    : null;
  if (opposite) lc = [opposite, ...lc];
  return lc;
}

export function getLinkedCardsPaired(card, sort = true) {
  // pairs everything up into one array
  var lc = getLinkedCards(card, sort);
  let arr = [card, ...lc];

  if (sort) {
    arr = arr.sort(function (a, b) {
      return a?.name === b?.name ? 0 : a?.name < b?.name ? -1 : 1;
    });
    for (let i = 0; i < CARD_COLOR_ORDER.length; i++) {
      let colorName = CARD_COLOR_ORDER[i];
      arr = arr.sort((x, y) => {
        return x.color_name === colorName
          ? 1
          : y.color_name === colorName
          ? -1
          : 0;
      });
    }
  }

  return arr;
}

export function getLinkedCardsPairedById(id, sort = true) {
  // pairs everything up into one array
  return getLinkedCardsPaired(getCardFromId(id), sort);
}

export function pairUpCards(allCards) {
  var alreadyIncludedCardIds = [];
  var pairedCards = [];
  for (let i = 0; i < allCards.length; i++) {
    let card = allCards[i];

    let cardPair = getLinkedCardsPaired(card);

    if (!alreadyIncludedCardIds.includes(cardPair?.[0]?.id)) {
      alreadyIncludedCardIds = [
        ...alreadyIncludedCardIds,
        ...cardPair.map((c) => c.id),
      ];
      pairedCards.push(cardPair);
    }
  }

  return pairedCards;
}
