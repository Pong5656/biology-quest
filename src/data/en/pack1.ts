import { c, k, q, s } from "../chapters/kit";
import type { EnglishPack } from "./types";

/** Hard English packs for chapters 1–8. Questions are application / analysis level. */
export const pack1: Record<number, EnglishPack> = {
  1: {
    bossName: "The Unknown",
    bossTitle: "Gatekeeper of Method",
    bossTaunt: "If you cannot tell a controlled test from a story, you will never leave this tower.",
    summary: {
      intro: "Biology studies living systems with testable methods. Life is organized from atoms to the biosphere, and claims are only as strong as the controls behind them.",
      equation: "Biology = bios (life) + logos (study)",
      cards: [
        c("🧬", "Properties of life", ["Cellular organization", "Metabolism and homeostasis", "Growth, reproduction, response"]),
        c("🔬", "Scientific method", ["Observation → testable hypothesis", "Independent, dependent, controlled variables", "A theory is a well-tested explanation"]),
        c("🔭", "Tools", ["Total mag. = objective × eyepiece", "Resolution, not magnification, sets detail", "FOV is already an actual distance"]),
        c("🚀", "STEM", ["Identify the problem before designing", "One changed factor per fair test", "Engineering cycle: test, then revise"]),
      ],
    },
    slides: [
      s("What biology claims", "A biological claim must be testable and falsifiable.\nA story that cannot be wrong is not a hypothesis.", "🔬", ["hypothesis", "falsifiable"]),
      s("Variables", "Independent = what you change.\nDependent = what you measure.\nControlled = held the same so the result can be blamed on one factor.", "⚖️", ["independent variable"]),
      s("Controls", "A control group does not receive the treatment.\nWithout it, you cannot tell treatment from coincidence.", "🧪", ["control"]),
      s("Data types", "Quantitative data are numbers with units.\nQualitative data are descriptions.\nBoth can be valid; only numbers support a calculated rate.", "📊", ["quantitative"]),
      s("Microscopy trap", "Field-of-view diameter is already the real distance across the view.\nDo not divide by magnification a second time.", "🔭", ["field of view"]),
      s("Cell theory limits", "Viruses are excluded because they lack cells and independent metabolism,\nnot merely because they are small.", "🦠", ["cell theory"]),
    ],
    keywords: [
      k("Control", "Which set makes a fertilizer trial interpretable?", ["The set that changes fertilizer and light together", "The set grown without fertilizer but otherwise identical", "The tallest plant, regardless of treatment"], 1, "The control holds every factor except the independent variable."),
      k("Resolution", "Raising only the eyepiece magnification mainly changes what?", ["The resolving power of the objective", "The apparent size, not the detail limit", "The wavelength of light"], 1, "Resolution is set by wavelength and numerical aperture."),
      k("Homeostasis", "Sweating when core temperature rises is an example of what?", ["Positive feedback that increases the stimulus", "Negative feedback that opposes the stimulus", "Growth"], 1, "The response reduces the original change."),
      k("Hypothesis", "Which statement is a usable hypothesis?", ["Plants are interesting", "If light intensity is halved, then biomass gain will fall", "Why do plants grow?"], 1, "A hypothesis states a testable if–then relationship."),
      k("Cell", "Why is a virus not classified as a living organism?", ["It has no nucleic acid", "It has no cell and no independent metabolism", "It cannot mutate"], 1, "Cellular organization and metabolism are required."),
    ],
    questions: [
      q("At 100× the measured field diameter is 1.8 mm. A cell spans one-sixth of that field. What is the cell’s actual diameter?", ["3 µm", "30 µm", "300 µm", "1800 µm"], 2, "FOV is already an actual distance: 1.8 mm / 6 = 0.3 mm = 300 µm. Do not divide by 100 again.", "Field diameter is real distance, not image size."),
      q("A team claims slope affects hydroponic yield, but each slope also received a different nutrient concentration. Which criticism is decisive?", ["The plants were the wrong species", "Slope and nutrient are confounded, so the cause cannot be isolated", "Graphs were used", "The hypothesis was written as an if–then statement"], 1, "Two factors changed together, so either could explain the result.", "Ask which variable was not held constant."),
      q("Which result would falsify the claim that microbes arise spontaneously from sterile broth?", ["Broth in an open flask becomes cloudy", "A swan-neck flask stays sterile until the neck is broken, then microbes appear", "Boiled broth smells different", "A microscope shows cells in pond water"], 1, "Pasteur’s design shows microbes come from air-borne cells, not from the broth itself.", "The flask that stays sterile is the key."),
      q("Which design gives the strongest evidence that fertilizer increases height?", ["One fertilized plant compared with last year’s memory", "20 fertilized and 20 unfertilized plants, same soil, light, water, and species, heights compared statistically", "Three fertilizers tested in three different greenhouses", "A survey of farmers’ opinions"], 1, "Replication plus a single manipulated factor supports a causal claim.", "Look for n, a control, and one changed factor."),
      q("Leaf color is recorded as yellow/green and stem length as centimetres. Which statement is correct?", ["Both are quantitative", "Color is qualitative; length is quantitative", "Both are qualitative", "Length is qualitative because it varies"], 1, "Qualitative data are categories; quantitative data are measured numbers.", "Units usually mark quantitative data."),
      q("Increasing the eyepiece from 10× to 20× while keeping a 40× objective will:", ["Double resolving power", "Double total magnification but not the resolution limit", "Halve the wavelength of light", "Double the field diameter"], 1, "Total magnification becomes 800×, but detail is still limited by the objective and light.", "Resolution is not the same as magnification."),
      q("A lizard moves into the sun until its body temperature rises, then retreats to shade. This is best described as:", ["Failure of homeostasis", "Behavioral negative feedback around a temperature range", "Positive feedback", "Evolution within one hour"], 1, "The behavior opposes further heating or cooling.", "The response reduces the original change."),
      q("Which finding would most seriously challenge cell theory as currently stated?", ["A bacterium smaller than 0.2 µm", "An independently metabolizing, self-replicating organism with no cellular organization", "A cell with two nuclei", "A virus that mutates"], 1, "Cell theory requires cellular organization and continuity of cells.", "Size alone does not break the theory."),
      q("In a graph of fertilizer dose (x) versus height (y), a flat line across all doses most strongly suggests:", ["The dependent variable was not affected in the tested range", "The independent variable was the height", "The experiment lacked a y-axis", "Homeostasis failed"], 0, "No change in the measured outcome means no detectable effect in that range.", "Read which axis is the result."),
      q("Why is “the plant grew because it wanted to” not a scientific explanation?", ["Plants do not have names", "It is not testable or falsifiable", "It uses the word because", "It is too short"], 1, "Scientific explanations must make predictions that could fail.", "Ask how you would prove it wrong."),
      q("A population of one tree species is wiped out by fire, but other species remain. Which level was lost?", ["The biosphere", "That population, not necessarily the whole community", "Every ecosystem on Earth", "The cell theory"], 1, "A community is all populations in an area; losing one population does not erase the community.", "Population = one species in one place."),
      q("Which sequence is a correct STEM design cycle?", ["Build → invent a problem → hide failed tests", "Define the problem → design → test → revise → present", "Present → skip testing → sell", "Change three variables, then conclude"], 1, "You cannot design a fair solution before the problem and constraints are clear.", "Problem comes before the prototype."),
      q("Two microscopes both magnify 400×. One resolves 0.2 µm, the other 0.5 µm. Which statement is true?", ["They show identical detail", "The 0.2 µm instrument can separate closer points", "The 0.5 µm instrument is always better", "Resolution equals 400"], 1, "Smaller resolution distance means finer detail.", "Lower resolution number = better detail."),
      q("Which variable is dependent in “does pH of water change tadpole survival?”", ["pH of the water", "Survival of tadpoles", "Species of tadpole if held constant", "The beaker brand"], 1, "Survival is the measured outcome.", "Dependent = the result you record."),
      q("A hypothesis is rejected by repeated, well-controlled tests. The scientific response is to:", ["Adjust the data until they fit", "Discard or revise the hypothesis", "Declare the method unscientific", "Increase magnification"], 1, "Data that contradict a hypothesis are a result, not a failure of science.", "Falsification is allowed."),
      q("Why can an obligate intracellular bacterium still be classified as living while a virus is not?", ["Bacteria are larger", "The bacterium is cellular and has its own metabolism; a virus does not", "Viruses contain DNA", "Bacteria never need a host"], 1, "Obligate parasitism alone does not exclude life; lack of cellular metabolism does.", "Do not use host-dependence as the only test."),
      q("Which pair is matched correctly?", ["Theory — a guess with no evidence", "Law — describes a pattern; theory — explains a mechanism", "Control — the variable you change", "Qualitative data — data with SI units only"], 1, "Laws summarize regularities; theories explain why they occur.", "Theory is not a weak guess."),
      q("A 40× objective and 10× eyepiece give which total magnification?", ["50×", "400×", "4×", "4000×"], 1, "40 × 10 = 400.", "Multiply the two lens powers."),
      q("Which practice most reduces bias when measuring plant height?", ["Letting each student choose which plants to measure", "Measuring all plants with the same ruler, same reference point, and a pre-registered sample", "Rounding every value up", "Discarding short plants"], 1, "Standardized measurement and a complete sample limit cherry-picking.", "Bias enters when you choose which data to keep."),
      q("An ecosystem differs from a community because an ecosystem:", ["Contains only one species", "Includes the community plus abiotic factors", "Cannot change", "Is always smaller than a population"], 1, "Ecosystem = biotic community + physical environment.", "Add non-living factors to a community."),
    ],
  },
};
