// ===== GAME DATA =====
// All static data used by the various game modules.

const hebrewLetters = [
  { letter: "א", name: "אריה", emoji: "🦁" },
  { letter: "א", name: "אבטיח", emoji: "🍉" },
  { letter: "ב", name: "בית", emoji: "🏠" },
  { letter: "ב", name: "בננה", emoji: "🍌" },
  { letter: "ג", name: "גלידה", emoji: "🍦" },
  { letter: "ג", name: "גשם", emoji: "🌧️" },
  { letter: "ד", name: "דג", emoji: "🐟" },
  { letter: "ד", name: "דבורה", emoji: "🐝" },
  { letter: "ה", name: "הר", emoji: "⛰️" },
  { letter: "ו", name: "ורד", emoji: "🌹" },
  { letter: "ז", name: "זברה", emoji: "🦓" },
  { letter: "ח", name: "חתול", emoji: "🐱" },
  { letter: "ח", name: "חלב", emoji: "🥛" },
  { letter: "ט", name: "טלפון", emoji: "📱" },
  { letter: "י", name: "ילד", emoji: "👦" },
  { letter: "י", name: "ירח", emoji: "🌙" },
  { letter: "כ", name: "כלב", emoji: "🐶" },
  { letter: "כ", name: "כוכב", emoji: "⭐" },
  { letter: "ל", name: "לב", emoji: "❤️" },
  { letter: "ל", name: "לימון", emoji: "🍋" },
  { letter: "מ", name: "מטוס", emoji: "✈️" },
  { letter: "מ", name: "מכונית", emoji: "🚗" },
  { letter: "נ", name: "נחש", emoji: "🐍" },
  { letter: "נ", name: "נמלה", emoji: "🐜" },
  { letter: "ס", name: "סוס", emoji: "🐴" },
  { letter: "ס", name: "סירה", emoji: "⛵" },
  { letter: "ע", name: "עכביש", emoji: "🕷️" },
  { letter: "ע", name: "עוגה", emoji: "🎂" },
  { letter: "פ", name: "פיל", emoji: "🐘" },
  { letter: "פ", name: "פרפר", emoji: "🦋" },
  { letter: "צ", name: "צב", emoji: "🐢" },
  { letter: "צ", name: "ציפור", emoji: "🐦" },
  { letter: "ק", name: "קוף", emoji: "🐵" },
  { letter: "ק", name: "קשת", emoji: "🌈" },
  { letter: "ר", name: "רכבת", emoji: "🚂" },
  { letter: "ר", name: "רובוט", emoji: "🤖" },
  { letter: "ש", name: "שמש", emoji: "☀️" },
  { letter: "ש", name: "שועל", emoji: "🦊" },
  { letter: "ת", name: "תפוח", emoji: "🍎" },
  { letter: "ת", name: "תות", emoji: "🍓" },
];

const countingEmojis = [
  "🍎",
  "🌟",
  "🐱",
  "🦋",
  "🌸",
  "🐶",
  "🍌",
  "🎈",
  "🐟",
  "🌈",
  "🍓",
  "🐰",
  "🌻",
  "🦄",
  "🍪",
];

const memoryEmojis = [
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐸",
  "🦁",
  "🐮",
  "🐷",
  "🐵",
  "🦄",
];

const colorsData = [
  { name: "אדום", color: "#e74c3c", emoji: "🔴" },
  { name: "כחול", color: "#3498db", emoji: "🔵" },
  { name: "ירוק", color: "#2ecc71", emoji: "🟢" },
  { name: "צהוב", color: "#f1c40f", emoji: "🟡" },
  { name: "כתום", color: "#e67e22", emoji: "🟠" },
  { name: "סגול", color: "#9b59b6", emoji: "🟣" },
  { name: "ורוד", color: "#ff69b4", emoji: "💗" },
  { name: "חום", color: "#8B4513", emoji: "🟤" },
];

const seasonsData = {
  קיץ: { emoji: "☀️", color: "#f39c12" },
  חורף: { emoji: "❄️", color: "#3498db" },
  אביב: { emoji: "🌸", color: "#2ecc71" },
  סתיו: { emoji: "🍂", color: "#e67e22" },
};

const seasonsItems = [
  { name: "שמש", emoji: "☀️", season: "קיץ" },
  { name: "גלידה", emoji: "🍦", season: "קיץ" },
  { name: "בגד ים", emoji: "👙", season: "קיץ" },
  { name: "ים", emoji: "🏖️", season: "קיץ" },
  { name: "משקפי שמש", emoji: "🕶️", season: "קיץ" },
  { name: "אבטיח", emoji: "🍉", season: "קיץ" },
  { name: "שלג", emoji: "❄️", season: "חורף" },
  { name: "איש שלג", emoji: "⛄", season: "חורף" },
  { name: "מטריה", emoji: "☂️", season: "חורף" },
  { name: "גשם", emoji: "🌧️", season: "חורף" },
  { name: "מעיל", emoji: "🧥", season: "חורף" },
  { name: "שוקו חם", emoji: "☕", season: "חורף" },
  { name: "פרח", emoji: "🌷", season: "אביב" },
  { name: "פרפר", emoji: "🦋", season: "אביב" },
  { name: "ציפור", emoji: "🐦", season: "אביב" },
  { name: "קשת", emoji: "🌈", season: "אביב" },
  { name: "דבורה", emoji: "🐝", season: "אביב" },
  { name: "עשב", emoji: "🌱", season: "אביב" },
  { name: "עלה נושר", emoji: "🍂", season: "סתיו" },
  { name: "דלעת", emoji: "🎃", season: "סתיו" },
  { name: "רוח", emoji: "🌬️", season: "סתיו" },
  { name: "ענן", emoji: "☁️", season: "סתיו" },
  { name: "ערמון", emoji: "🌰", season: "סתיו" },
  { name: "עלים", emoji: "🍁", season: "סתיו" },
];

const mixingColors = [
  { name: "אדום", color: [255, 0, 0], hex: "#ff0000" },
  { name: "כחול", color: [0, 0, 255], hex: "#0000ff" },
  { name: "צהוב", color: [255, 255, 0], hex: "#ffff00" },
  { name: "ירוק", color: [0, 180, 0], hex: "#00b400" },
  { name: "כתום", color: [255, 140, 0], hex: "#FF8C00" },
  { name: "סגול", color: [139, 0, 255], hex: "#8B00FF" },
  { name: "ורוד", color: [255, 105, 180], hex: "#FF69B4" },
  { name: "לבן", color: [255, 255, 255], hex: "#ffffff" },
  { name: "שחור", color: [0, 0, 0], hex: "#000000" },
];

function addMixPair(results, c1, c2, name, color) {
  results[c1 + "+" + c2] = { name, color };
  results[c2 + "+" + c1] = { name, color };
}

const mixingResults = {};
addMixPair(mixingResults, "אדום", "כחול", "סגול! 💜", "#8B00FF");
addMixPair(mixingResults, "אדום", "צהוב", "כתום! 🧡", "#FF8C00");
addMixPair(mixingResults, "כחול", "צהוב", "ירוק! 💚", "#00AA00");
addMixPair(mixingResults, "אדום", "לבן", "ורוד! 💗", "#FF69B4");
addMixPair(mixingResults, "כחול", "לבן", "תכלת! 💙", "#87CEEB");
addMixPair(mixingResults, "צהוב", "לבן", "צהוב בהיר! 💛", "#FFFF99");
addMixPair(mixingResults, "ירוק", "לבן", "ירוק בהיר! 🍀", "#90EE90");
addMixPair(mixingResults, "כתום", "לבן", "אפרסק! 🍑", "#FFDAB9");
addMixPair(mixingResults, "סגול", "לבן", "לילך! 🪻", "#DDA0DD");
addMixPair(mixingResults, "ורוד", "לבן", "ורוד בהיר! 🌸", "#FFB6C1");
addMixPair(mixingResults, "אדום", "שחור", "בורדו! 🍷", "#800020");
addMixPair(mixingResults, "כחול", "שחור", "כחול כהה! 🫐", "#00008B");
addMixPair(mixingResults, "צהוב", "שחור", "ירוק זית! 🫒", "#808000");
addMixPair(mixingResults, "ירוק", "שחור", "ירוק כהה! 🌲", "#006400");
addMixPair(mixingResults, "כתום", "שחור", "חום! 🟤", "#8B4513");
addMixPair(mixingResults, "סגול", "שחור", "סגול כהה! 🍇", "#4B0082");
addMixPair(mixingResults, "ורוד", "שחור", "ורוד כהה! 🌺", "#C71585");
addMixPair(mixingResults, "לבן", "שחור", "אפור! 🩶", "#808080");
addMixPair(mixingResults, "אדום", "ירוק", "חום! 🟤", "#8B4513");
addMixPair(mixingResults, "אדום", "כתום", "אדום-כתום! 🔥", "#FF4500");
addMixPair(mixingResults, "אדום", "סגול", "בורדו! 🍷", "#C71585");
addMixPair(mixingResults, "אדום", "ורוד", "אדום בהיר! ❤️", "#FF6B6B");
addMixPair(mixingResults, "כחול", "ירוק", "טורקיז! 🧊", "#008B8B");
addMixPair(mixingResults, "כחול", "כתום", "חום אפרפר! 🪨", "#696969");
addMixPair(mixingResults, "כחול", "סגול", "אינדיגו! 💎", "#4B0082");
addMixPair(mixingResults, "כחול", "ורוד", "לילך! 🪻", "#9370DB");
addMixPair(mixingResults, "צהוב", "ירוק", "ירוק ליים! 🍈", "#ADFF2F");
addMixPair(mixingResults, "צהוב", "כתום", "צהוב זהב! ✨", "#FFD700");
addMixPair(mixingResults, "צהוב", "סגול", "חום בהיר! 🥜", "#D2B48C");
addMixPair(mixingResults, "צהוב", "ורוד", "אפרסק! 🍑", "#FFDAB9");
addMixPair(mixingResults, "ירוק", "כתום", "חום זית! 🫒", "#6B8E23");
addMixPair(mixingResults, "ירוק", "סגול", "אפור כהה! 🪨", "#556B2F");
addMixPair(mixingResults, "ירוק", "ורוד", "חום בהיר! 🍂", "#BC8F8F");
addMixPair(mixingResults, "כתום", "סגול", "חום אדמדם! 🧱", "#A0522D");
addMixPair(mixingResults, "כתום", "ורוד", "סלמון! 🐟", "#FA8072");
addMixPair(mixingResults, "סגול", "ורוד", "מג'נטה! 🌺", "#FF00FF");

const raceQuestionTypes = ["counting", "colors", "math"];
