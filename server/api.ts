import { GoogleGenAI, Type } from '@google/genai';
import { IncomingMessage, ServerResponse } from 'http';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function callGeminiSafely(ai: GoogleGenAI, prompt: string, systemInstruction: string, schema: any) {
  // Stable production models with graceful cascade
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      if (response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      // Silently try next model if 503 or transient failure
      continue;
    }
  }
  return null;
}

export async function handleAiRecommendRequest(req: IncomingMessage, res: ServerResponse) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      const { 
        garmentType = 'shirt', 
        occasion = 'casual', 
        climate = 'mild', 
        measurements = {}, 
        currentFabric = 'cotton',
        currentColor = 'Imperial Bordeaux',
        currentFit = 'regular',
        stylePreference = '',
        comfortPreference = ''
      } = payload;

      const ai = getGeminiClient();

      if (ai) {
        const prompt = `You are an elite haute-couture master tailor and fashion technologist for "CustomFit AI".
Analyze the user's bespoke clothing request:
- Garment Type: ${garmentType}
- Occasion: ${occasion}
- Climate: ${climate}
- Current selections: fabric=${currentFabric}, color=${currentColor}, fit=${currentFit}
- User style preferences: ${stylePreference || 'Balanced elegance'}
- User comfort preferences: ${comfortPreference || 'Flexible and breathable'}
- Customer measurements: ${JSON.stringify(measurements)}

Generate tailored, highly practical recommendations for fabrics, colors, fits, sleeve styles, and necklines suited for this exact garment, climate, and occasion. Include expert reasoning explaining breathability, drape, formality, and silhouette balance.`;

        const schema = {
          type: Type.OBJECT,
          properties: {
            primaryAdvice: { type: Type.STRING, description: 'Direct style and fit advice headline' },
            recommendedFabrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fabricId: { type: Type.STRING, description: 'One of: cotton, linen, silk, denim, wool, rayon, polyester, organic_cotton, blended' },
                  title: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['fabricId', 'title', 'reason']
              }
            },
            recommendedColors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  colorHex: { type: Type.STRING },
                  colorName: { type: Type.STRING },
                  paletteVibe: { type: Type.STRING }
                },
                required: ['colorHex', 'colorName', 'paletteVibe']
              }
            },
            recommendedFit: {
              type: Type.OBJECT,
              properties: {
                fit: { type: Type.STRING, description: 'One of: slim, regular, relaxed, oversized' },
                reason: { type: Type.STRING }
              },
              required: ['fit', 'reason']
            },
            recommendedSleeve: {
              type: Type.OBJECT,
              properties: {
                sleeve: { type: Type.STRING, description: 'One of: sleeveless, short, three_quarter, long, puff, bell' },
                reason: { type: Type.STRING }
              }
            },
            recommendedNeckline: {
              type: Type.OBJECT,
              properties: {
                neckline: { type: Type.STRING, description: 'One of: round, v_neck, square, boat, collar, high_neck' },
                reason: { type: Type.STRING }
              }
            },
            tailorNotes: { type: Type.STRING, description: 'Construction advice for the garment makers (ease, seam allowances, drape)' }
          },
          required: ['primaryAdvice', 'recommendedFabrics', 'recommendedColors', 'recommendedFit', 'tailorNotes']
        };

        const result = await callGeminiSafely(
          ai,
          prompt,
          'You are an AI Master Tailor and Bespoke Garment Stylist. Return clean structured JSON only matching the schema.',
          schema
        );

        if (result?.text) {
          try {
            const parsed = JSON.parse(result.text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, source: result.model, data: parsed }));
            return;
          } catch (e) {
            // fallback
          }
        }
      }

      // High-precision intelligent fallback rule system if key is missing or rate limited
      const fallback = generateStylistFallback(garmentType, occasion, climate, currentFabric);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, source: 'customfit-expert-engine', data: fallback }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
    }
  });
}

function generateStylistFallback(garmentType: string, occasion: string, climate: string, currentFabric: string) {
  let advice = '';
  let fabricId = 'cotton';
  let fabricTitle = 'Fine Supima Cotton';
  let fabricReason = 'Natural breathability and crisp structural hold.';
  let fit = 'regular';
  let fitReason = 'Balanced silhouette providing comfort and clean drape.';
  let sleeve = 'long';
  let sleeveReason = 'Versatile coverage adaptable to different settings.';
  let neckline = 'collar';
  let necklineReason = 'Timeless framing for balanced proportions.';

  if (climate === 'hot' || climate === 'humid') {
    fabricId = 'linen';
    fabricTitle = 'Pure Normandy Flax Linen';
    fabricReason = 'Exceptional breathability and natural capillary moisture-wicking properties.';
    fit = 'relaxed';
    fitReason = 'Allows air circulation between fabric and skin during warm temperatures.';
    if (garmentType === 'shirt' || garmentType === 'tshirt') {
      sleeve = 'short';
      sleeveReason = 'Optimum ventilation and effortless casual chic.';
    }
  } else if (climate === 'cold') {
    fabricId = 'wool';
    fabricTitle = 'Super 130s Merino Wool';
    fabricReason = 'Natural thermal regulation and wrinkle-resistant bounce.';
    fit = 'regular';
    fitReason = 'Accommodates subtle base-layering without constriction.';
  } else if (occasion === 'party' || occasion === 'formal') {
    fabricId = 'silk';
    fabricTitle = 'Mulberry Charmeuse Silk';
    fabricReason = 'Subtle liquid luster, graceful drape, and luxurious skin contact.';
    fit = 'slim';
    fitReason = 'Accentuates tailoring lines for heightened elegance under evening lighting.';
  }

  if (occasion === 'casual') {
    advice = `For casual ${climate} outings, prioritising relaxed movement and breathable weave will elevate comfort without sacrificing tailoring integrity.`;
  } else if (occasion === 'formal' || occasion === 'work') {
    advice = `For professional and formal environments, crisp structure, refined necklines, and premium natural fibers deliver distinguished authority and all-day poise.`;
  } else {
    advice = `Harmonizing ${garmentType} geometry with ${climate} conditions guarantees both aesthetic appeal and bespoke ergonomic freedom.`;
  }

  return {
    primaryAdvice: advice,
    recommendedFabrics: [
      {
        fabricId,
        title: fabricTitle,
        reason: fabricReason
      },
      {
        fabricId: 'blended',
        title: 'Linen-Silk Performance Blend',
        reason: 'Combines structural airflow with a gentle, luxurious luminous drape.'
      }
    ],
    recommendedColors: [
      { colorHex: '#631024', colorName: 'Imperial Bordeaux', paletteVibe: 'Sophisticated wine richness with deep contrast' },
      { colorHex: '#121214', colorName: 'Midnight Noir', paletteVibe: 'Architectural minimalism and versatile timelessness' },
      { colorHex: '#ede8dd', colorName: 'Champagne Ecru', paletteVibe: 'Warm understated luxury that softens facial tones' }
    ],
    recommendedFit: {
      fit,
      reason: fitReason
    },
    recommendedSleeve: {
      sleeve,
      reason: sleeveReason
    },
    recommendedNeckline: {
      neckline,
      reason: necklineReason
    },
    tailorNotes: `Pattern grade requires +2.5cm chest ease for sitting relaxation. Double-turn hem with French seams recommended for ${fabricTitle}.`
  };
}

export async function handleAiBargainRequest(req: IncomingMessage, res: ServerResponse) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      const {
        garmentName = 'Bespoke Garment',
        fabricName = 'Fine Fabric',
        standardPrice = 5000,
        proposedPrice = 4250,
        discountPercentage = 15,
        reason = 'First-time client exploring bespoke tailoring',
        customNote = '',
        round = 1,
        competitorEvidence = null
      } = payload;

      const ai = getGeminiClient();

      if (ai) {
        const evidenceDetails = competitorEvidence ? `
- Competitor Evidence Provided by Patron:
  * Platform: ${competitorEvidence.platform}
  * Competitor Item: "${competitorEvidence.listingTitle || 'Comparable ready-made piece'}"
  * Competitor Online Price: ₹${competitorEvidence.competitorPrice}
  * Price Difference: The competitor is ₹${standardPrice - competitorEvidence.competitorPrice} cheaper (${Math.round(((standardPrice - competitorEvidence.competitorPrice) / standardPrice) * 100)}% lower).
Special Competitor Evidence Guideline:
Acknowledge the patron's ${competitorEvidence.platform} price comparison directly! Point out with authentic tailor wisdom why ready-made garments from mass online platforms use synthetic blends, fused glue canvas, and generic S/M/L grading, while CustomFit hand-crafts 100% bespoke ${fabricName} cut to their individual anatomical measurements. However, because the patron took the effort to bring verifiable market evidence, honor their savvy research and offer a substantial "Market Match Concession" (e.g. 18%-22% off, or meeting close to their proposed price) so they don't settle for fast-fashion.` : '';

        const prompt = `You are Master Tailor Rajesh, an experienced, prestigious, and charismatic Savile Row & Mumbai haute-couture bespoke master tailor at "CustomFit AI".
You are currently engaged in a respectful bargaining dialogue with a patron who is ordering a ${garmentName} crafted in genuine ${fabricName}.

Pricing context:
- Standard Atelier Price: ₹${standardPrice}
- Patron Proposed Offer: ₹${proposedPrice} (${discountPercentage}% concession / discount)
- Negotiation Round: ${round} of 3
- Patron's Stated Reason: "${reason}"
${customNote ? `- Patron's Personal Note: "${customNote}"` : ''}
${evidenceDetails}

Tailor Personality & Rules:
1. Master Rajesh is warm, eloquent, deeply proud of his hand-stitch craft, but understands patron negotiation.
2. If competitor evidence is provided: Address the platform (${competitorEvidence?.platform}) directly. Defend bespoke quality over off-the-rack mass-manufacturing, but offer a competitive match concession up to 18%-22% off!
3. If the discount is 5% to 13%: ACCEPT the deal with a graceful handshake quote congratulating their taste. Set decision to "accept", finalPrice to ₹${proposedPrice}, dealAgreed to true.
4. If the discount is 14% to 23%:
   - If round 1 or 2: Make a spirited counter-offer (usually meeting them halfway or conceding 15%-18%), citing fabric yardage or pattern cutting. Set decision to "counter", propose a reasonable counterPrice in INR (e.g. around ₹${Math.round(standardPrice * 0.84)}), dealAgreed to false.
   - If round 3: Either accept or provide your final concession floor (e.g. 18%-20% off). Set decision to "counter" or "accept".
5. If the discount is 24% or more: Gently chuckle at their bold audacity, note that hand-stitched craft has real costs, and propose a dignified counter-offer around 15%-16% off (or up to 20% if competitor proof was provided). Set decision to "counter", dealAgreed to false.

Respond in JSON matching the schema.`;

        const bargainSchema = {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING, description: 'One of: accept, counter' },
            tailorResponse: { type: Type.STRING, description: 'Direct spoken quote from Master Rajesh in first-person' },
            counterPrice: { type: Type.NUMBER, description: 'Counter offer price in INR if counter, or final price if accept' },
            dealAgreed: { type: Type.BOOLEAN, description: 'True if handshake deal accepted' }
          },
          required: ['decision', 'tailorResponse', 'counterPrice', 'dealAgreed']
        };

        const result = await callGeminiSafely(
          ai,
          prompt,
          'You are Master Tailor Rajesh. Respond with pure JSON matching the schema.',
          bargainSchema
        );

        if (result?.text) {
          try {
            const parsed = JSON.parse(result.text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, source: result.model, data: parsed }));
            return;
          } catch (e) {
            // fallback
          }
        }
      }

      // Rule-based Master Rajesh decision
      let decision: 'accept' | 'counter' = 'counter';
      let tailorResponse = '';
      let counterPrice = proposedPrice;
      let dealAgreed = false;

      if (competitorEvidence && competitorEvidence.competitorPrice && competitorEvidence.competitorPrice < standardPrice) {
        // Special Market-Match logic when user provides competitor evidence
        const compPrice = competitorEvidence.competitorPrice;
        const platformName = competitorEvidence.platform || 'other platforms';
        const itemTitle = competitorEvidence.listingTitle || 'mass-produced alternative';

        if (proposedPrice >= Math.round(standardPrice * 0.80)) {
          // If the patron proposes a reasonable match (up to 20% off), tailor graciously accepts honoring the evidence!
          decision = 'accept';
          dealAgreed = true;
          counterPrice = proposedPrice;
          tailorResponse = `Aha! You bring me verified evidence from ${platformName} showing "${itemTitle}" at ₹${compPrice.toLocaleString('en-IN')}! Look closely at their tag, my friend—that is mass-produced off-the-rack sizing with synthetic blends and fused glue linings. Here at CustomFit, your ${garmentName} is single-needle hand-felled in genuine ${fabricName} drafted strictly to your individual biometrics. BUT, because you brought hard market proof and I refuse to lose a smart patron to fast fashion, I will honor your market evidence and seal our handshake at ₹${proposedPrice.toLocaleString('en-IN')}!`;
        } else {
          // Patron proposes aggressive cut matching or beating competitor
          const matchFloor = Math.round(standardPrice * 0.80); // 20% off maximum master floor
          const competitiveCounter = Math.max(matchFloor, Math.round((proposedPrice + compPrice) / 2));
          decision = 'counter';
          counterPrice = competitiveCounter;
          const savings = standardPrice - competitiveCounter;
          const pct = Math.round((savings / standardPrice) * 100);
          tailorResponse = `Aha! You show me this listing on ${platformName} for ₹${compPrice.toLocaleString('en-IN')}! In ready-to-wear, factories churn out 10,000 identical pieces with synthetic canvas. Here at CustomFit, each piece of ${fabricName} is cut by my own shears to your exact body curvature with zero deadstock. However, because you showed genuine market proof, I will grant a special Master Market-Match concession of ₹${competitiveCounter.toLocaleString('en-IN')} (${pct}% off, saving you ₹${savings.toLocaleString('en-IN')})! Let us shake hands on real bespoke quality!`;
        }
      } else if (discountPercentage <= 13) {
        decision = 'accept';
        dealAgreed = true;
        counterPrice = proposedPrice;
        tailorResponse = `Splendid! You have the keen eye of a connoisseur and the fairness of a true patron. For a ${fabricName} piece of this caliber, I gladly seal our handshake at ₹${proposedPrice.toLocaleString('en-IN')}. May it serve you with distinction!`;
      } else if (discountPercentage <= 22) {
        if (round >= 3) {
          counterPrice = Math.round(standardPrice * 0.82);
          decision = 'counter';
          tailorResponse = `You are as unyielding as pure Irish linen, my friend! But your appreciation for our artisanal work won me over. I cannot do ₹${proposedPrice.toLocaleString('en-IN')}, but on my personal cutter's honor, I will seal our final handshake at ₹${counterPrice.toLocaleString('en-IN')} (18% concession). This is my final word!`;
        } else {
          counterPrice = Math.round(standardPrice - ((standardPrice - proposedPrice) * 0.6));
          decision = 'counter';
          tailorResponse = `Ah! You cut close to the lining! The raw ${fabricName} bolt and hand-felled stitches have fixed artisanal costs. However, because ${reason.toLowerCase()}, I will meet you halfway at ₹${counterPrice.toLocaleString('en-IN')}. Does this honor our craft?`;
        }
      } else {
        const floorPrice = Math.round(standardPrice * 0.85);
        decision = 'counter';
        tailorResponse = `Hahaha! You have a great sense of humor! For ₹${proposedPrice.toLocaleString('en-IN')}, I could barely give you one sleeve of pure ${fabricName}! We are a Savile Row-trained atelier, not a ready-made factory. But because your audacity made me smile, here is an honorable counter: ₹${floorPrice.toLocaleString('en-IN')} (15% off). Propose something realistic!`;
        counterPrice = floorPrice;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        source: 'customfit-tailor-rules',
        data: {
          decision,
          tailorResponse,
          counterPrice,
          dealAgreed
        }
      }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err?.message || 'Bargaining server error' }));
    }
  });
}
