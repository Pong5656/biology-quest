import { card, key, lesson, slide } from "./build";
import { lines } from "./lines";
import type { EnglishPack } from "./types";

const shell = (
  bossName: string,
  bossTitle: string,
  bossTaunt: string,
  intro: string,
  equation: string,
  slides: [string, string][],
  keys: [string, string, [string, string, string], 0 | 1 | 2, string][],
  questions: string[],
): EnglishPack =>
  lesson({
    bossName,
    bossTitle,
    bossTaunt,
    intro,
    equation,
    cards: [
      card("📘", "Core idea", [intro.slice(0, 90)]),
      card("🧪", "How to reason", ["Separate cause from correlation", "Track units and direction of gradients", "Name the compartment before the molecule"]),
      card("⚠️", "Exam traps", ["Do not divide a field of view twice", "Net ATP is not gross ATP", "A name is not a mechanism"]),
      card("🎯", "Apply it", ["Predict the direction of water, ions, or electrons", "Ask what is held constant", "State what the control would show"]),
    ],
    slides: slides.map(([title, text]) => slide(title, text, "📘")),
    keywords: keys.map(([keyword, question, choices, answer, explanation]) => key(keyword, question, choices, answer, explanation)),
    questions: lines(questions),
  });

export const pack3: Record<number, EnglishPack> = {
  3: shell(
    "Organelle King",
    "Warden of the Cell",
    "Name the wrong compartment and the city collapses.",
    "Cells stay small because exchange depends on surface area. Membranes sort traffic, and mitochondria extract far more ATP when oxygen is available.",
    "Aerobic yield is about 36-38 ATP per glucose, not 2.",
    [
      ["Surface to volume", "A larger cell has relatively less membrane per unit volume, so diffusion cannot keep up."],
      ["Tonicity", "Water follows solute. Hypertonic surroundings shrink animal cells; hypotonic surroundings swell them."],
      ["Pumps", "The sodium-potassium pump moves 3 Na+ out and 2 K+ in, using ATP, against both gradients."],
      ["Respiration", "Glycolysis nets 2 ATP in the cytosol. The electron-transport chain on the inner membrane makes most of the rest."],
      ["Division", "Mitosis keeps chromosome number. Meiosis halves it for gametes."],
    ],
    [
      ["Osmosis", "Movement of water across a selectively permeable membrane is called:", ["Active transport", "Osmosis", "Phagocytosis"], 1, "Water, not solute, is the substance that diffuses."],
      ["Cristae", "The folded inner membrane of a mitochondrion is the:", ["Crista", "Grana", "Nucleolus"], 0, "Folds increase area for ATP synthase."],
      ["Glycolysis", "Splitting glucose into pyruvate is called:", ["The Krebs cycle", "Glycolysis", "The Calvin cycle"], 1, "It occurs in the cytosol and does not require oxygen."],
      ["Lysosome", "Which organelle digests worn-out organelles?", ["Ribosome", "Lysosome", "Nucleolus"], 1, "It holds hydrolytic enzymes."],
      ["G0", "Mature neurons that no longer divide are typically in:", ["G0", "S phase", "Metaphase"], 0, "G0 is a non-dividing state outside the cycle."],
    ],
    [
      "Red blood cells are placed in 3% NaCl, which is hypertonic to their cytosol. The cells will:||Swell and burst||Shrink (crenate)||Stay unchanged||Start mitosis||1||Water leaves the cells toward the higher external solute concentration.||Hypertonic outside means water exits.",
      "Glucose crosses a membrane down its gradient through a carrier, with no ATP used. This is:||Simple diffusion through the bilayer||Facilitated diffusion||Primary active transport||Exocytosis||1||A protein helps, but the gradient still drives the move.||No ATP plus a carrier is the clue.",
      "Each cycle of the sodium-potassium pump moves:||3 K+ in and 2 Na+ out||3 Na+ out and 2 K+ in||1 Na+ in and 1 K+ out||3 Na+ in and 3 K+ out||1||The pump exports more positive charge than it imports.||Remember 3 out, 2 in.",
      "Net ATP from glycolysis of one glucose is:||2||4||18||36||0||Four are made and two are spent, so the profit is 2.||Subtract the investment.",
      "When oxygen is absent, animal cells typically convert pyruvate to:||Carbon dioxide and water only||Lactate, regenerating NAD+||RuBP||Cellulose||1||Fermentation keeps glycolysis running by recycling NAD+.||No oxygen means the mitochondrion cannot take the electrons.",
      "Mitochondria contain their own DNA and ribosomes. This best supports:||Cell theory alone||Endosymbiotic origin||The fluid-mosaic model||Chargaff rule||1||The organelle looks like a reduced bacterium living inside a host.||Own genome is the key evidence.",
      "Chromosomes line up at the cell equator during:||Prophase||Metaphase||Anaphase||Telophase||1||Meta- means middle.||Anaphase is the separation step.",
      "Relative to G1, the DNA amount per nucleus just after S phase is:||Unchanged||Doubled||Halved||Quadrupled||1||S phase replicates the genome before division.||Synthesis means copying DNA.",
      "A eukaryotic cell lacks membrane-bounded organelles. That description fits:||No living cell||A prokaryotic cell, not a eukaryote||Only a plant cell||Only a neuron||1||Prokaryotes have no nucleus or membrane organelles.||The premise describes bacteria, not eukaryotes.",
      "Why are most cells microscopic?||Gravity forbids large proteins||Surface-to-volume ratio must stay high enough for exchange||Membranes cannot be polar||DNA cannot be long||1||Volume grows faster than surface, so large cells starve or poison themselves.||Compare area with volume as size increases.",
      "The Krebs cycle runs in the:||Cytosol||Mitochondrial matrix||Thylakoid lumen||Nucleolus||1||Pyruvate oxidation feeds the matrix cycle.||The inner membrane is for the chain, not the cycle.",
      "The mitochondrial electron-transport chain is located in the:||Outer membrane only||Inner membrane||Plasma membrane of every cell||Nuclear envelope||1||Cristae house the carriers and ATP synthase.||Folded inner membrane is the site.",
      "Which process produces gametes with half the chromosome number?||Mitosis||Meiosis||Binary fission of a mitochondrion||Glycolysis||1||Meiosis reduces diploid to haploid.||Mitosis copies the full set.",
      "A cell in a hypotonic solution will:||Lose water||Gain water and may lyse if it lacks a wall||Immediately denature DNA||Stop osmosis forever||1||The outside is more dilute, so water enters.||Animal cells have no wall to resist swelling.",
      "Moving sodium out of a cell against its gradient requires:||Osmosis||Active transport and ATP||Simple diffusion||A hypotonic trick||1||Against a gradient is the definition of active transport.||Pumps pay with ATP.",
      "The fluid-mosaic model describes:||A rigid protein sheet||A movable phospholipid bilayer with embedded proteins||A cellulose wall||A chromosome||1||Lipids drift; proteins float in that sea.||Fluid means the membrane is not a fixed crystal.",
      "Which organelle packages and ships proteins?||Golgi apparatus||Lysosome only||Ribosome only||Centriole||0||The Golgi receives vesicles from the ER and sorts cargo.||Ribosomes make proteins; they do not ship them.",
      "Rough ER is rough because it:||Lacks lipids||Is studded with ribosomes||Is full of chlorophyll||Has no membrane||1||Bound ribosomes make secretory and membrane proteins.||Smooth ER lacks those ribosomes.",
      "If the inner mitochondrial membrane were freely leaky to protons, ATP synthesis would:||Increase||Fall, because the proton gradient could not be maintained||Become independent of oxygen||Move to the nucleus||1||Chemiosmosis needs an intact membrane.||A leak is a short circuit.",
      "A drug blocks ATP synthase but not electron transport. The immediate effect is:||More ATP and a collapsed gradient||Electron flow eventually stalls as the proton gradient becomes too steep and ATP falls||Glycolysis moves into the matrix||DNA replication speeds up||1||Without ATP synthase, protons cannot return and the chain backs up.||Gradient and ATP synthesis are coupled.",
    ],
  ),
};
