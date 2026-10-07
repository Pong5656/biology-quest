import { ask, card, key, lesson, slide } from "./build";
import type { EnglishPack } from "./types";

export const pack2: Record<number, EnglishPack> = {
  2: lesson({
    bossName: "Molecule Tyrant",
    bossTitle: "Keeper of Bonds",
    bossTaunt: "Miss one bond and the whole molecule falls apart.",
    intro: "Life is carbon chemistry in water. Four macromolecule classes, plus enzymes and ATP, do nearly all cellular work.",
    equation: "Macromolecules: carbohydrate, protein, lipid, nucleic acid",
    cards: [
      card("⚛️", "Atoms and bonds", ["CHON dominate biomass", "Isotopes differ in neutrons", "Covalent bonds share electrons"]),
      card("💧", "Water", ["Polar solvent", "Cohesion and adhesion", "High specific heat; ice floats"]),
      card("⚙️", "Enzymes", ["Specific active site", "Denature when shape is lost", "pH and temperature optima"]),
      card("🔋", "ATP and nucleic acids", ["Nucleotide = sugar + base + phosphate", "RNA uses U, not T", "ATP is the short-term energy currency"]),
    ],
    slides: [
      slide("Chargaff trap", "In double-stranded DNA, A equals T and G equals C.\nPercentages must add to 100 before you build a ratio.", "🧬", ["Chargaff"]),
      slide("pH", "pH = -log[H+]. A tenfold rise in [H+] drops pH by 1.\nBlood is held near 7.4 by buffers.", "🍋", ["pH"]),
      slide("Water", "Adhesion is attraction to a different surface.\nCohesion is attraction between water molecules.", "💧", ["adhesion"]),
      slide("Enzymes", "Heat can speed a reaction, then destroy the fold.\nA denatured enzyme is not merely slowed.", "⚙️", ["denature"]),
      slide("Membranes", "Phospholipid heads face water on both sides of the bilayer.\nTails hide from water in the core.", "🧱", ["phospholipid"]),
    ],
    keywords: [
      key("Isotope", "12C and 14C differ in the number of which particle?", ["Protons", "Neutrons", "Electrons"], 1, "Same element means the same proton count."),
      key("Peptide bond", "Which bond joins amino acids in a protein chain?", ["Hydrogen bond", "Peptide bond", "Glycosidic bond"], 1, "It links the carboxyl of one amino acid to the amino group of the next."),
      key("Denature", "What does a high temperature do to most enzymes?", ["It permanently improves the active site", "It unfolds the protein so the active site is lost", "It converts the enzyme into DNA"], 1, "Shape loss, not a change of element, ends catalysis."),
      key("Adhesion", "A concave water meniscus on glass is mainly due to:", ["Adhesion to glass", "Ice being denser than water", "A peptide bond"], 0, "Water is pulled up the glass more than it coheres to itself."),
      key("ATP", "Why do cells use ATP rather than burning glucose in every step?", ["ATP is larger than glucose", "ATP releases a small, controllable packet of energy", "ATP has no phosphate"], 1, "Most reactions need a coin, not the whole banknote."),
    ],
    questions: [
      ask("Double-stranded DNA is 28% adenine. What is the G : C : T ratio?", ["22 : 22 : 28", "28 : 28 : 22", "22 : 28 : 22", "44 : 28 : 28"], 0, "A = T = 28%. The remaining 44% is split equally, so G = C = 22%.", "Apply Chargaff, then force the total to 100%."),
      ask("A solution has [H+] = 1 × 10^-5 mol/L. Its pH and class are:", ["pH 5, acidic", "pH 5, basic", "pH 9, basic", "pH -5, acidic"], 0, "pH = 5, which is below 7, so the solution is acidic.", "pH is the negative log of hydrogen-ion concentration."),
      ask("Ice floats on liquid water. The biological consequence is that:", ["Lakes freeze solid from the bottom up", "Surface ice insulates the liquid habitat below", "Fish must leave the water", "Water stops being polar"], 1, "The crystal is less dense, so ice stays on top.", "Think about a frozen pond in winter."),
      ask("An enzyme rate rises from 20°C to 37°C, then collapses by 80°C. Why does it collapse?", ["The substrate has become an isotope", "The protein denatures and the active site is lost", "ATP has become DNA", "pH must have become 7"], 1, "Past the optimum, heat breaks the interactions that hold tertiary structure.", "Speed-up and destruction are different parts of the curve."),
      ask("Which set contains only disaccharides?", ["Maltose, lactose, sucrose", "Glucose, fructose, galactose", "Starch, cellulose, glycogen", "Glucose, sucrose, starch"], 0, "Those three are two-sugar molecules. The others are mono- or polysaccharides.", "Watch the -ose ending, but check the class."),
      ask("Amylase is mixed with a pure protein and no starch. The expected result is:", ["Rapid production of amino acids", "Little or no catalysis, because the active site does not fit protein", "Conversion of protein into cellulose", "Denaturation of the protein by amylase"], 1, "Enzymes are specific. Amylase binds starch, not a polypeptide.", "Lock-and-key: wrong shape, no reaction."),
      ask("Beta-pleated sheets are stabilized mainly by:", ["Peptide bonds between R groups", "Hydrogen bonds between backbone groups", "Disulfide bonds only", "Ionic bonds to sodium"], 1, "Secondary structure is backbone hydrogen bonding, not the peptide bond itself.", "The peptide bond builds the chain; H-bonds fold it."),
      ask("In a membrane bilayer, phospholipid heads point:", ["Toward each other in the core", "Outward toward water on both faces", "Only toward proteins", "Only toward the nucleus"], 1, "Heads are hydrophilic, so both aqueous faces are lined with heads.", "Cytoplasm and extracellular fluid are both watery."),
      ask("Amino acids in proteins differ from one another at the:", ["Carboxyl group", "Amino group", "R group", "Alpha carbon only"], 2, "The backbone is shared. The side chain makes each amino acid distinct.", "Three parts match; one part varies."),
      ask("Which comparison of RNA and DNA is accurate?", ["RNA uses uracil and is usually single-stranded", "RNA uses thymine and is always double-stranded", "DNA uses uracil", "RNA has no sugar"], 0, "RNA replaces T with U and is typically one strand.", "Name the base that DNA has and RNA lacks."),
      ask("12C and 14C are:", ["Ions of different charge", "Isotopes with the same proton count and different neutron counts", "Different elements", "Isomers of glucose"], 1, "Isotopes share atomic number and differ in mass number.", "Protons define the element."),
      ask("A covalent bond forms when atoms:", ["Transfer electrons and become ions", "Share electrons", "Are held only by gravity", "Lose all neutrons"], 1, "Sharing, not transfer, defines a covalent bond.", "Ionic bonds are the transfer case."),
      ask("High specific heat of water mainly helps organisms by:", ["Making water boil at 0°C", "Resisting rapid temperature change", "Preventing hydrogen bonds", "Turning enzymes into lipids"], 1, "A lot of energy is needed to change water temperature.", "Coastal climates and body fluids both stay steadier."),
      ask("Normal human blood pH is closest to:", ["2.0", "5.0", "7.4", "9.5"], 2, "Blood is slightly alkaline and tightly buffered.", "It is not neutral in the school sense of exactly 7.0."),
      ask("Sucrose is built from:", ["Glucose + glucose", "Glucose + fructose", "Glucose + galactose", "Two amino acids"], 1, "Table sugar is glucose joined to fructose.", "Lactose is the glucose-galactose pair."),
      ask("Which polysaccharide is the main structural fiber of plant cell walls?", ["Glycogen", "Starch", "Cellulose", "Chitin"], 2, "Cellulose is beta-glucose fiber. Glycogen is animal storage.", "Chitin is fungal and arthropod, not plant wall."),
      ask("A buffer in blood is valuable because enzymes:", ["Work at any pH", "Lose function outside a narrow pH range", "Are made of lipids", "Require boiling"], 1, "The bicarbonate system resists pH swings that would denature proteins.", "Shape is pH-sensitive."),
      ask("Quaternary structure requires:", ["One polypeptide only", "Two or more polypeptide chains associated together", "Only an alpha helix", "A phospholipid"], 1, "Hemoglobin is the classic multi-chain example.", "One chain can have tertiary structure but not quaternary."),
      ask("Which molecule is the immediate donor of energy for most cellular work?", ["Glucose", "ATP", "Starch", "DNA"], 1, "Glucose is a store; ATP is the spendable packet.", "Look for the molecule used in one reaction step."),
      ask("A protein heated until it no longer binds its substrate has most likely:", ["Gained a new active site that is better", "Denatured", "Become an isotope", "Turned into cellulose"], 1, "Loss of specific binding means the fold, not the atoms, has changed.", "Specificity disappears when shape disappears."),
    ],
  }),
};
