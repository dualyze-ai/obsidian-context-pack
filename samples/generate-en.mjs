import fs from 'fs';
import path from 'path';

const BASE = 'samples/vault';

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function recipe({ folder, title, tags, photo, desc, ingredients, seasoning, steps, tips, memo }) {
  const tagStr = tags.map(t => `  - ${t}`).join('\n');
  const ingRows = ingredients.map(([n, a]) => `| ${n} | ${a} |`).join('\n');
  const seaRows = seasoning.map(([n, a]) => `| ${n} | ${a} |`).join('\n');
  const stepStr = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const tipStr = tips.map(t => `- ${t}`).join('\n');
  const photoLine = photo ? `\n![${title}](${photo})\n` : '';

  const content = `---
tags:
${tagStr}
---

# ${title}
${photoLine}
${desc}

## Ingredients (serves 4)

| Ingredient | Amount |
|---|---|
${ingRows}

### Seasonings

| Seasoning | Amount |
|---|---|
${seaRows}

## Instructions

${stepStr}

## Tips

${tipStr}

## Notes

${memo}
`;
  write(path.join(BASE, 'recipes', folder, `${title}.md`), content);
}

function travel({ folder, subfolder, title, tags, photo, overview, access, highlights, food, memo }) {
  const tagStr = tags.map(t => `  - ${t}`).join('\n');
  const hlStr = highlights.map(h => `- ${h}`).join('\n');
  const foodStr = food.map(f => `- ${f}`).join('\n');
  const photoLine = photo ? `\n![${title}](${photo})\n` : '';

  const content = `---
tags:
${tagStr}
---

# ${title}
${photoLine}
## Overview

${overview}

## Access

${access}

## Highlights

${hlStr}

## Food & Dining

${foodStr}

## Tips & Advice

${memo}
`;
  const dir = subfolder
    ? path.join(BASE, 'travel', folder, subfolder)
    : path.join(BASE, 'travel', folder);
  write(path.join(dir, `${title}.md`), content);
}

function book({ folder, title, author, tags, overview, insights, quote, learning }) {
  const tagStr = tags.map(t => `  - ${t}`).join('\n');
  const insightStr = insights.map(i => `- ${i}`).join('\n');

  const content = `---
tags:
${tagStr}
---

# ${title}

**Author:** ${author}

## Overview

${overview}

## Key Takeaways

${insightStr}

## Memorable Quote

> ${quote}

## How I Apply It

${learning}
`;
  write(path.join(BASE, 'books', folder, `${title}.md`), content);
}

// ===== RECIPES (20 notes) =====

// Japanese (8 notes)
recipe({
  folder: 'Japanese', title: 'Nikujaga',
  tags: ['Japanese', 'difficulty:medium', 'time:30min', 'type:simmered'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Braised_pork_and_potatoes_%283089327692%29.jpg/960px-Braised_pork_and_potatoes_%283089327692%29.jpg',
  desc: 'A beloved Japanese home-cooked dish of beef and potatoes simmered in a sweet-savory sauce. Comfort food at its finest.',
  ingredients: [['Thinly sliced beef','200g'],['Potatoes','3 medium'],['Onion','1 large'],['Carrot','1 medium'],['Shirataki noodles','1 pack']],
  seasoning: [['Dashi stock','200ml'],['Soy sauce','3 tbsp'],['Mirin','3 tbsp'],['Sugar','2 tbsp'],['Sake','2 tbsp']],
  steps: [
    'Cut potatoes into bite-size pieces and soak in water. Cut carrot into irregular chunks, onion into wedges.',
    'Cut shirataki into manageable lengths and blanch briefly to remove odor.',
    'Heat oil in a pot and cook beef until browned. Add vegetables and stir until coated with oil.',
    'Add dashi. Once boiling, skim foam, add seasonings, cover with a drop lid, and simmer over medium heat for 15 minutes.',
    'Add shirataki noodles and cook another 5 minutes to absorb flavors.',
  ],
  tips: ['Do not overcook potatoes — they break apart easily.', 'A drop lid (otoshibuta) ensures even flavor absorption.', 'Tastes even better the next day.'],
  memo: 'Beef is traditional in Kansai, pork in Kanto. Add more sugar for a sweeter finish.',
});

recipe({
  folder: 'Japanese', title: 'Oyakodon',
  tags: ['Japanese', 'difficulty:easy', 'time:20min', 'type:rice-bowl'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Oyakodon_003.jpg/960px-Oyakodon_003.jpg',
  desc: 'Chicken and egg gently simmered in dashi and served over rice. One of Japan\'s most iconic donburi dishes.',
  ingredients: [['Chicken thigh','250g'],['Eggs','3'],['Onion','1/2'],['Mitsuba (or parsley)','to taste'],['Cooked rice','2 servings']],
  seasoning: [['Dashi stock','150ml'],['Soy sauce','2 tbsp'],['Mirin','2 tbsp'],['Sugar','1 tsp']],
  steps: [
    'Cut chicken into bite-size pieces, slice onion thinly, and beat eggs.',
    'In a small donburi pan, combine seasonings and onion and simmer over medium heat for 2–3 minutes.',
    'Add chicken and cook 4–5 minutes until done.',
    'Pour in beaten egg in a circular motion, cover, and remove from heat when egg is still slightly runny.',
    'Slide over rice and garnish with mitsuba.',
  ],
  tips: ['Add egg in two stages for a more even set.', 'The key is a silky, half-cooked egg — use residual heat to finish.'],
  memo: 'Marinating chicken in soy sauce beforehand adds extra depth.',
});

recipe({
  folder: 'Japanese', title: 'Kakuni (Braised Pork Belly)',
  tags: ['Japanese', 'difficulty:hard', 'time:120min', 'type:simmered'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Kakuni_by_Kanko.jpg',
  desc: 'Melt-in-your-mouth braised pork belly, simmered low and slow in soy, mirin, and sake. A showstopper dish for special occasions.',
  ingredients: [['Pork belly (block)','600g'],['Green part of leek','1 stalk'],['Ginger','2 slices'],['Soft-boiled eggs','4']],
  seasoning: [['Soy sauce','4 tbsp'],['Mirin','4 tbsp'],['Sake','100ml'],['Sugar','3 tbsp'],['Water','300ml']],
  steps: [
    'Sear pork belly on all sides in a frying pan to lock in juices.',
    'Place pork, leek, ginger, and water in a pressure cooker. Pressure cook for 30 minutes.',
    'Remove pork and cut into serving pieces.',
    'Transfer to a pot with seasonings and simmer over medium heat for 20 minutes.',
    'Add soft-boiled eggs and cook a further 10 minutes.',
  ],
  tips: ['Initial searing locks in umami.', 'Refrigerate overnight and skim the solidified fat for a cleaner dish.'],
  memo: 'Without a pressure cooker, simmer on low heat for at least 2 hours. Even better made a day ahead.',
});

recipe({
  folder: 'Japanese', title: 'Chikuzen-ni',
  tags: ['Japanese', 'difficulty:medium', 'time:45min', 'type:simmered', 'type:osechi'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/%E7%AD%91%E5%89%8D%E7%85%AE%E3%81%AF%E3%83%88%E3%83%AC%E3%83%BC%E3%81%8C%E6%B1%9A%E3%82%8C%E3%82%81%E3%81%AA%E3%81%AE%E3%81%A7%E6%9D%93%E5%AD%90%E6%88%BB%E3%81%95%E3%81%9A_%2855071808273%29.jpg/960px-%E7%AD%91%E5%89%8D%E7%85%AE%E3%81%AF%E3%83%88%E3%83%AC%E3%83%BC%E3%81%8C%E6%B1%9A%E3%82%8C%E3%82%81%E3%81%AA%E3%81%AE%E3%81%A7%E6%9D%93%E5%AD%90%E6%88%BB%E3%81%95%E3%81%9A_%2855071808273%29.jpg',
  desc: 'A hearty simmered dish of chicken and root vegetables, essential for New Year\'s osechi. Rich, earthy flavors in every bite.',
  ingredients: [['Chicken thigh','300g'],['Burdock root (gobo)','1'],['Lotus root (renkon)','150g'],['Carrot','1'],['Dried shiitake','4'],['Konjac (konnyaku)','1 block'],['Snow peas','to taste']],
  seasoning: [['Dashi (incl. shiitake soaking water)','300ml'],['Soy sauce','3 tbsp'],['Mirin','3 tbsp'],['Sugar','2 tbsp'],['Sake','2 tbsp']],
  steps: [
    'Rehydrate shiitake and cut in half. Slice gobo diagonally, cut renkon into chunks, and soak both in water. Tear konnyaku by hand and blanch.',
    'Pan-fry chicken until lightly browned; remove.',
    'Stir-fry vegetables in the same pan, return chicken, add dashi and seasonings.',
    'Cover with a drop lid and simmer over medium heat for 20 minutes. Add snow peas at the end.',
  ],
  tips: ['Soak gobo and renkon to remove bitterness.', 'Tearing konnyaku by hand increases surface area for better flavor absorption.'],
  memo: 'Great for meal prep — keeps in the fridge for 3–4 days.',
});

recipe({
  folder: 'Japanese', title: 'Dashimaki Tamago',
  tags: ['Japanese', 'difficulty:hard', 'time:15min', 'type:egg'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Dashimaki_tamago_and_teapot_by_yajico_in_Ebisu%2C_Tokyo.jpg/960px-Dashimaki_tamago_and_teapot_by_yajico_in_Ebisu%2C_Tokyo.jpg',
  desc: 'A fluffy, dashi-infused rolled omelette in the Kansai style. Deceptively simple, endlessly refined.',
  ingredients: [['Eggs','3'],['Dashi stock','60ml'],['Vegetable oil','as needed']],
  seasoning: [['Light soy sauce (usukuchi)','1/2 tsp'],['Mirin','1 tsp'],['Salt','a pinch']],
  steps: [
    'Beat eggs and whisk together with dashi and seasonings.',
    'Heat a rectangular tamagoyaki pan, oil lightly, pour in 1/3 of the egg mixture.',
    'When semi-set, roll from far end toward you.',
    'Push roll back, oil pan again, add another 1/3 of the mixture, and roll again.',
    'Repeat with remaining egg. Shape with a bamboo mat while warm, then slice.',
  ],
  tips: ['Keep heat at medium-low to avoid burning.', 'A bamboo mat gives a professional shape.', 'Make sure egg mix is well combined before cooking.'],
  memo: 'Add 1 tbsp sugar for a sweeter version. Serve with grated daikon for a classic diner touch.',
});

recipe({
  folder: 'Japanese', title: 'Tonjiru (Pork Miso Soup)',
  tags: ['Japanese', 'difficulty:easy', 'time:25min', 'type:soup'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/CodazziTonjiru1.jpg',
  desc: 'A thick, hearty miso soup loaded with pork and root vegetables. The ultimate warming bowl for cold days.',
  ingredients: [['Pork belly (sliced)','150g'],['Daikon','5cm'],['Carrot','1/2'],['Burdock root','1/2'],['Konjac','1/2 block'],['Leek','1']],
  seasoning: [['Dashi stock','800ml'],['Miso','3–4 tbsp'],['Sake','1 tbsp'],['Sesame oil','1 tsp']],
  steps: [
    'Cut all vegetables into bite-size pieces. Soak gobo in water.',
    'Heat sesame oil in a pot and cook pork.',
    'Add vegetables and stir until coated. Pour in dashi.',
    'Simmer about 15 minutes, skimming foam, until vegetables are tender.',
    'Lower heat, dissolve miso into soup, add leek, and bring just to a simmer.',
  ],
  tips: ['Never boil after adding miso — it kills the aroma.', 'Soak gobo thoroughly to remove astringency.'],
  memo: 'A pinch of shichimi chili flakes adds a nice kick. Just as good reheated the next day.',
});

recipe({
  folder: 'Japanese', title: 'Grilled Saury (Sanma Shioyaki)',
  tags: ['Japanese', 'difficulty:easy', 'time:20min', 'type:grilled', 'season:autumn'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Sanma_by_beemartins_in_Matsushima%2C_Miyagi.jpg',
  desc: 'The taste of autumn in Japan. Simply salted and grilled pacific saury, enjoyed with grated daikon and sudachi citrus.',
  ingredients: [['Pacific saury (sanma)','2 fish'],['Salt','to taste'],['Grated daikon','to taste'],['Sudachi (or lime)','1'],['Soy sauce','a splash']],
  seasoning: [['Salt','about 2% of fish weight']],
  steps: [
    'Remove entrails if preferred (keeping them adds a pleasant bitterness). Score the skin diagonally.',
    'Season generously with salt and rest 10 minutes, then pat dry.',
    'Preheat grill to high. Cook 4–5 minutes per side until skin is crisp.',
    'Serve immediately.',
    'Accompany with grated daikon and sudachi.',
  ],
  tips: ['Scoring ensures even cooking.', 'High heat from the start makes the skin crispy.'],
  memo: 'True connoisseurs enjoy the bitter liver — try it whole! Peak season is September–October.',
});

recipe({
  folder: 'Japanese', title: 'Karaage (Japanese Fried Chicken)',
  tags: ['Japanese', 'difficulty:medium', 'time:30min', 'type:fried'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Chicken_karaage_003.jpg/960px-Chicken_karaage_003.jpg',
  desc: 'Crispy outside, juicy inside — Japan\'s definitive fried chicken. Marinated in ginger, garlic, and soy for maximum flavor.',
  ingredients: [['Chicken thigh','400g'],['Potato starch (katakuriko)','4 tbsp'],['All-purpose flour','2 tbsp'],['Frying oil','as needed'],['Lemon','1/4']],
  seasoning: [['Soy sauce','2 tbsp'],['Sake','2 tbsp'],['Mirin','1 tbsp'],['Ginger (grated)','1 knob'],['Garlic (grated)','1 clove']],
  steps: [
    'Cut chicken into bite-size pieces and marinate in seasonings for at least 30 minutes.',
    'Mix potato starch and flour; coat chicken pieces, shaking off excess.',
    'Fry at 170°C for 3–4 minutes. Remove and rest for 1 minute.',
    'Increase oil to 180°C and fry again for 1–2 minutes for extra crunch.',
    'Drain and serve with lemon.',
  ],
  tips: ['Double-frying is the secret to crunch that lasts.', 'Overnight marinating deepens flavor significantly.'],
  memo: 'All potato starch = crunchier. Mixing in flour = lighter crispiness. Both are delicious.',
});

// Western (7 notes)
recipe({
  folder: 'Western', title: 'Japanese Hamburg Steak',
  tags: ['Western', 'difficulty:medium', 'time:40min', 'type:meat'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hamburg-Steak.jpg/960px-Hamburg-Steak.jpg',
  desc: 'The beloved Japanese-style hamburger steak with a crispy crust and juicy center, finished with a rich demi-glace sauce.',
  ingredients: [['Ground beef and pork mix','400g'],['Onion','1/2'],['Egg','1'],['Breadcrumbs','1/2 cup'],['Milk','3 tbsp'],['Salt','1/2 tsp'],['Pepper','a pinch'],['Nutmeg','a pinch']],
  seasoning: [['Demi-glace sauce (canned)','1 can'],['Red wine','100ml'],['Butter','10g'],['Worcestershire sauce','1 tbsp']],
  steps: [
    'Caramelize minced onion in butter until golden; cool completely.',
    'Mix ground meat, breadcrumbs soaked in milk, egg, onion, salt, pepper, and nutmeg until sticky.',
    'Shape into 4 oval patties with a dimple in the center.',
    'Sear over high heat, then reduce heat, cover, and cook 8 minutes.',
    'Combine sauce ingredients and simmer to reduce; pour over patties.',
  ],
  tips: ['Knead well to eliminate air pockets that cause cracking.', 'A hot sear first, then steam-cook on low for the perfect interior.'],
  memo: 'Substitute tofu for a lighter version. A Japanese-style sauce with grated daikon is equally delicious.',
});

recipe({
  folder: 'Western', title: 'Spaghetti Carbonara',
  tags: ['Western', 'difficulty:medium', 'time:20min', 'type:pasta'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/960px-Espaguetis_carbonara.jpg',
  desc: 'Authentic Roman-style carbonara with no cream — just eggs, aged cheese, and guanciale. Rich, silky, and perfectly savory.',
  ingredients: [['Spaghetti','200g'],['Pancetta (or guanciale)','100g'],['Eggs','2'],['Egg yolks','2'],['Pecorino Romano (or Parmigiano)','60g'],['Black pepper','generously']],
  seasoning: [['Salt (for pasta water)','1% of water volume'],['Olive oil','1 tbsp']],
  steps: [
    'Whisk together eggs, yolks, cheese, and plenty of black pepper.',
    'Cut pancetta into strips and render in olive oil until crisp.',
    'Cook pasta in well-salted water; reserve a cup of pasta water.',
    'Remove pan from heat, add drained pasta and toss with pancetta.',
    'Pour over egg mixture and stir quickly, loosening with pasta water to reach a creamy consistency.',
  ],
  tips: ['Always add egg off the heat — scrambled carbonara is a disaster.', 'Finely grated cheese melts more smoothly.'],
  memo: 'The starch in pasta water is the key emulsifier. Reserve more than you think you need.',
});

recipe({
  folder: 'Western', title: 'Beef Stew',
  tags: ['Western', 'difficulty:hard', 'time:120min', 'type:braised'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Boeuf_Bourguignon_Paris_Beaubourg.jpg/960px-Boeuf_Bourguignon_Paris_Beaubourg.jpg',
  desc: 'A classic slow-braised beef stew with red wine, root vegetables, and demi-glace. Perfect for cold winter evenings.',
  ingredients: [['Beef shin (or shoulder)','500g'],['Onions','2'],['Carrots','2'],['Mushrooms','100g'],['Potatoes','2'],['Garlic','2 cloves'],['Tomato paste','2 tbsp']],
  seasoning: [['Red wine','300ml'],['Beef broth','400ml'],['Demi-glace (canned)','1/2 can'],['Salt and pepper','to taste'],['Bay leaves','2'],['Thyme','a pinch']],
  steps: [
    'Cut beef into large chunks, season with salt and pepper, and dust with flour.',
    'Brown beef on all sides in butter; remove and set aside.',
    'Sauté onion and garlic in the same pot; add red wine and cook off the alcohol.',
    'Return beef, add remaining ingredients, and simmer on low for 90 minutes.',
    'Adjust seasoning with salt when vegetables are tender.',
  ],
  tips: ['A thorough initial sear is essential for rich flavor.', 'Low and slow is the key to fork-tender meat.'],
  memo: 'Even better reheated the next day. Serve with mashed potatoes for a classic presentation.',
});

recipe({
  folder: 'Western', title: 'Omurice',
  tags: ['Western', 'difficulty:medium', 'time:30min', 'type:rice'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Omurice_by_Taimeiken.jpg/960px-Omurice_by_Taimeiken.jpg',
  desc: 'Japan\'s beloved ketchup-fried rice wrapped in a thin egg omelette. A retro classic beloved by children and adults alike.',
  ingredients: [['Cooked rice','2 bowls'],['Eggs','3'],['Chicken thigh','100g'],['Onion','1/4'],['Mushrooms','4'],['Butter','20g']],
  seasoning: [['Ketchup','4 tbsp'],['Salt and pepper','to taste'],['Milk','1 tbsp (for eggs)']],
  steps: [
    'Stir-fry chicken, onion, and mushrooms in butter; add rice and toss with ketchup until combined.',
    'Whisk eggs with milk and a pinch of salt.',
    'In a buttered pan, pour egg mixture and spread into a thin layer until just set.',
    'Place fried rice on one side and fold egg over to wrap.',
    'Flip onto plate and decorate with ketchup.',
  ],
  tips: ['Move quickly — egg should remain soft and silky.', 'Dry the fried rice well to prevent sogginess.'],
  memo: 'A "fluffy" style where a loose, creamy omelette is draped over the rice is equally popular. Demi-glace sauce works great too.',
});

recipe({
  folder: 'Western', title: 'Minestrone',
  tags: ['Western', 'difficulty:easy', 'time:40min', 'type:soup'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Minestrone_soup_%285%29.jpg/960px-Minestrone_soup_%285%29.jpg',
  desc: 'A hearty Italian vegetable soup with tomatoes and white beans. Nutritious, warming, and infinitely customizable.',
  ingredients: [['Onion','1'],['Carrot','1'],['Celery','1 stalk'],['Zucchini','1'],['Potato','1'],['Bacon','50g'],['Canned tomatoes','1 can'],['White beans (canned)','1 can'],['Small pasta','50g']],
  seasoning: [['Vegetable broth','600ml'],['Olive oil','2 tbsp'],['Garlic','1 clove'],['Salt and pepper','to taste'],['Parmigiano','to finish']],
  steps: [
    'Dice all vegetables into 1cm cubes.',
    'Heat olive oil in a pot and sauté garlic and bacon.',
    'Add onion, carrot, and celery; cook 5 minutes. Add remaining vegetables.',
    'Pour in tomatoes, broth, and beans. Simmer 20 minutes.',
    'Add pasta and cook per package instructions; season with salt.',
  ],
  tips: ['Uniform dice ensures even cooking.', 'Beans add protein and satisfying bulk.'],
  memo: 'Finish with freshly grated Parmigiano. Even better the next day once flavors have melded.',
});

recipe({
  folder: 'Western', title: 'Macaroni Gratin',
  tags: ['Western', 'difficulty:medium', 'time:50min', 'type:baked'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Gratin-Dauphinois.jpg',
  desc: 'A bubbling, golden gratin of chicken, mushrooms, and macaroni in creamy béchamel. The ultimate winter comfort dish.',
  ingredients: [['Chicken thigh','200g'],['Macaroni','100g'],['Onion','1/2'],['Mushrooms','6'],['Shredded cheese','80g'],['Butter','30g'],['All-purpose flour','30g'],['Milk','400ml']],
  seasoning: [['Salt and pepper','to taste'],['Nutmeg','a pinch'],['Bouillon cube','1']],
  steps: [
    'Cook macaroni; sauté chicken and vegetables.',
    'Melt butter, stir in flour, and gradually whisk in milk to make a smooth béchamel.',
    'Season with bouillon, nutmeg, salt and pepper.',
    'Fold in chicken, vegetables, and macaroni; transfer to gratin dish.',
    'Top with cheese and bake at 200°C for 20 minutes until golden.',
  ],
  tips: ['Add milk gradually while whisking to prevent lumps.', 'Bake until deeply golden and bubbling.'],
  memo: 'Add shrimp or spinach for a more luxurious version.',
});

recipe({
  folder: 'Western', title: 'Korokke (Japanese Croquettes)',
  tags: ['Western', 'difficulty:medium', 'time:60min', 'type:fried'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Croquetas_Caseras_%287068664101%29.jpg/960px-Croquetas_Caseras_%287068664101%29.jpg',
  desc: 'Japan\'s answer to croquettes — crispy breaded potato-and-meat patties best eaten hot with tonkatsu sauce.',
  ingredients: [['Potatoes','4 (600g)'],['Ground beef and pork mix','150g'],['Onion','1/2'],['Egg','1'],['Breadcrumbs','as needed'],['All-purpose flour','as needed'],['Frying oil','as needed']],
  seasoning: [['Salt and pepper','to taste'],['Butter','10g']],
  steps: [
    'Boil and mash potatoes; season with salt, pepper, and butter.',
    'Cook onion and ground meat; season and cool completely.',
    'Mix mashed potato and meat filling; shape into oval patties.',
    'Coat in flour → beaten egg → breadcrumbs.',
    'Deep-fry at 170°C until golden brown.',
  ],
  tips: ['Remove moisture from mashed potato to prevent them from bursting.', 'Coat thoroughly for a crust that holds.'],
  memo: 'Add curry powder for a curry korokke twist. Makes great freeze-ahead meals.',
});

// Chinese (5 notes)
recipe({
  folder: 'Chinese', title: 'Mapo Tofu',
  tags: ['Chinese', 'difficulty:medium', 'time:20min', 'type:tofu', 'spice:medium'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Chen_Mapo_Tofu.jpg/960px-Chen_Mapo_Tofu.jpg',
  desc: 'The iconic Sichuan dish — silken tofu in a fiery, numbing sauce of doubanjiang and Sichuan peppercorns.',
  ingredients: [['Silken tofu','1 block (400g)'],['Ground pork','150g'],['Green onion','1/2'],['Ginger','1 knob'],['Garlic','2 cloves']],
  seasoning: [['Doubanjiang (chili bean paste)','1 tbsp'],['Tianmianjiang (sweet bean paste)','1 tbsp'],['Soy sauce','1 tbsp'],['Chicken stock','200ml'],['Potato starch','1 tbsp'],['Sichuan peppercorns','1 tsp'],['Sesame oil','1 tsp']],
  steps: [
    'Cut tofu into 2cm cubes and simmer briefly in salted water; drain. Mince green onion, ginger, and garlic.',
    'Heat oil, fry ginger and garlic until fragrant. Add doubanjiang and tianmianjiang; cook until oil turns red.',
    'Add pork and cook through. Pour in stock and bring to a boil.',
    'Add tofu and simmer gently for 5 minutes. Thicken with starch slurry.',
    'Add green onion, drizzle sesame oil, and finish with ground Sichuan peppercorns.',
  ],
  tips: ['Pre-cooking tofu in salted water keeps it firm.', 'Adding Sichuan peppercorns at the very end maximizes the numbing aroma.'],
  memo: 'Adjust heat level with doubanjiang quantity. Extra chili oil adds more fire.',
});

recipe({
  folder: 'Chinese', title: 'Chahan (Chinese Fried Rice)',
  tags: ['Chinese', 'difficulty:medium', 'time:15min', 'type:rice'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg/960px-Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg',
  desc: 'Wok-fried rice that\'s light, fragrant, and perfectly separated. High heat and quick hands are the secret.',
  ingredients: [['Cold cooked rice','2 bowls'],['Eggs','2'],['Green onion','1/3'],['Char siu (or bacon)','50g'],['Vegetable oil','2 tbsp']],
  seasoning: [['Soy sauce','1 tbsp'],['Chicken stock granules','1 tsp'],['Salt and pepper','to taste'],['Sesame oil','1 tsp']],
  steps: [
    'Beat eggs, mince green onion, and dice char siu.',
    'Heat wok or pan over maximum heat and add oil.',
    'Pour in eggs and stir briskly; before fully set, add cold rice.',
    'Break apart rice while stir-frying vigorously. Add char siu and green onion.',
    'Add soy sauce along the edges of the wok; season with stock granules, salt, pepper, and sesame oil.',
  ],
  tips: ['Wok must be screaming hot before you start.', 'Cold rice means individual grains, not clumps.'],
  memo: 'The "egg-coated rice" method (mix egg into rice first, then fry) also produces fluffy, separated grains.',
});

recipe({
  folder: 'Chinese', title: 'Ebi Chili (Shrimp in Chili Sauce)',
  tags: ['Chinese', 'difficulty:medium', 'time:25min', 'type:seafood'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ebi_Chili_Mayo_%283469826035%29.jpg/960px-Ebi_Chili_Mayo_%283469826035%29.jpg',
  desc: 'Plump shrimp tossed in a sweet and spicy chili sauce. A crowd-pleasing Chinese-Japanese fusion classic.',
  ingredients: [['Tiger shrimp (or black tiger)','300g'],['Green onion','1/2'],['Ginger','1 knob'],['Garlic','1 clove']],
  seasoning: [['Doubanjiang','2 tsp'],['Ketchup','3 tbsp'],['Sugar','1 tbsp'],['Sake','1 tbsp'],['Chicken stock','100ml'],['Potato starch','1 tsp'],['Sesame oil','a dash']],
  steps: [
    'Remove veins from shrimp, massage with starch and salt, then rinse clean.',
    'Mince green onion, ginger, and garlic.',
    'Stir-fry shrimp in oil until pink; remove.',
    'Sauté aromatics in the same pan, add doubanjiang and cook until fragrant.',
    'Add ketchup, stock, and sugar; return shrimp and thicken with starch slurry.',
  ],
  tips: ['Massaging shrimp with starch gives a plump, bouncy texture.', 'Cook doubanjiang until the oil turns red for full flavor.'],
  memo: 'A spoonful of mayonnaise makes it milder and creamy — an "Ebi Mayo" variation.',
});

recipe({
  folder: 'Chinese', title: 'Sweet and Sour Pork (Subuta)',
  tags: ['Chinese', 'difficulty:medium', 'time:35min', 'type:meat'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sweet_and_sour_pork.jpg/960px-Sweet_and_sour_pork.jpg',
  desc: 'Crispy fried pork and colorful vegetables coated in a tangy sweet-and-sour sauce. A perennial family favorite.',
  ingredients: [['Pork belly or shoulder','300g'],['Bell peppers','2'],['Carrot','1/2'],['Onion','1/2'],['Canned pineapple','4 rings'],['Potato starch','as needed']],
  seasoning: [['Vinegar','3 tbsp'],['Sugar','3 tbsp'],['Ketchup','2 tbsp'],['Soy sauce','1 tbsp'],['Chicken stock','100ml'],['Potato starch (for sauce)','1 tbsp']],
  steps: [
    'Marinate pork in soy sauce, sake, and ginger; coat with starch.',
    'Deep-fry at 170°C; rest 1 minute, then fry again at 180°C for crunch.',
    'Lightly fry vegetables in the same oil.',
    'Combine vinegar, sugar, ketchup, soy sauce, and stock into a sauce and bring to a boil.',
    'Toss pork, vegetables, and pineapple in the sauce.',
  ],
  tips: ['Double-frying keeps pork crispy even after saucing.', 'Make the sauce at the last moment for the freshest flavor.'],
  memo: 'Pineapple adds natural sweetness and acid. Feel free to omit if you prefer.',
});

recipe({
  folder: 'Chinese', title: 'Dan Dan Noodles (Tantanmen)',
  tags: ['Chinese', 'difficulty:hard', 'time:40min', 'type:noodles', 'spice:medium'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Soupless_dandan_noodles_%28mild%29_of_175do_DENO_Tantanmen.jpg/960px-Soupless_dandan_noodles_%28mild%29_of_175do_DENO_Tantanmen.jpg',
  desc: 'Noodles in a rich, sesame-forward broth with spiced ground pork and the addictive tingle of Sichuan peppercorns.',
  ingredients: [['Chinese noodles (fresh)','2 portions'],['Ground pork','150g'],['Bok choy','2 heads'],['Green onion','1/2']],
  seasoning: [['Sesame paste (tahini or neri goma)','4 tbsp'],['Doubanjiang','1 tbsp'],['Soy sauce','2 tbsp'],['Rice vinegar','1 tbsp'],['Sugar','1 tsp'],['Chicken stock','400ml'],['Chili oil','to taste'],['Sichuan pepper','to taste'],['Ground sesame','2 tbsp']],
  steps: [
    'Cook ground pork with tianmianjiang and soy sauce to make spiced meat topping.',
    'Whisk sesame paste, soy sauce, vinegar, sugar, and doubanjiang into a tare sauce.',
    'Heat stock and stir in tare.',
    'Cook noodles, pour broth over, top with spiced pork, bok choy, and green onion.',
    'Finish with chili oil and Sichuan peppercorns.',
  ],
  tips: ['Thin the sesame paste with a little water before mixing for easier incorporation.', 'Do not boil the broth after adding the sesame — heat gently.'],
  memo: 'Try a dry version (soup-free) for an even more concentrated, intense flavor.',
});

// ===== TRAVEL NOTES (20 notes) =====

// Japan — Kanto (3 notes)
travel({
  folder: 'Asia', subfolder: 'Japan/Kanto', title: 'Kamakura',
  tags: ['Asia', 'Japan', 'Kanto', 'Kanagawa', 'History', 'Day Trip', 'season:Spring-Autumn'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/TsurugaokaHachiman-M8867.jpg/960px-TsurugaokaHachiman-M8867.jpg',
  overview: 'A coastal historic city south of Tokyo, once the seat of Japan\'s first shogunate government. Temples, shrines, and hiking trails are set against a backdrop of sea and mountains.',
  access: 'About 1 hour from Tokyo Station via JR Yokosuka Line. Also accessible via Shonan-Shinjuku Line. Kamakura Station is the main hub.',
  highlights: ['Kotoku-in Great Buddha (National Treasure)', 'Tsurugaoka Hachimangu Shrine', 'Kita-Kamakura temples: Engaku-ji & Kencho-ji', 'Hase-dera in hydrangea season (June)', 'Kamakura Alps hiking trails', 'Yuigahama & Zaimokuza beaches'],
  food: ['Shirasu-don (whitebait rice bowl)', 'Hato Sable cookies (Toyoshimaya)', 'Matcha and wagashi sweets', 'Street food along Komachi-dori'],
  memo: 'Weekdays are far less crowded. Hydrangea season (June) and autumn foliage (Nov–Dec) are peak. The Enoden day pass is great value.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Kanto', title: 'Nikko',
  tags: ['Asia', 'Japan', 'Kanto', 'Tochigi', 'UNESCO', 'History', 'Nature'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg/960px-200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg',
  overview: 'A UNESCO World Heritage Site in northern Tochigi, centered on Nikko Tosho-gu, the ornate mausoleum of Tokugawa Ieyasu. Stunning nature surrounds the elaborate Edo-period architecture.',
  access: 'About 2 hours from Asakusa on the Tobu Nikko Limited Express Spacia. About 45 min from Utsunomiya on the JR Nikko Line.',
  highlights: ['Nikko Tosho-gu (UNESCO)', 'Yomeimon Gate (spectacularly ornate carvings)', 'Kegon Falls (one of Japan\'s Top 3 waterfalls)', 'Lake Chuzenji', 'Senjogahara marshland (hiking)', 'Ryuzu Falls'],
  food: ['Yuba (tofu skin) cuisine — a Nikko specialty', 'Nikko-age yuba', 'Yuba and soba set meals', 'Nikko Jingorō senbei crackers', 'Nikko milk'],
  memo: 'Autumn foliage (mid-Oct to early Nov) is spectacular but extremely crowded. A bus is needed for the Chuzenji Lake area.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Kanto', title: 'Hakone',
  tags: ['Asia', 'Japan', 'Kanto', 'Kanagawa', 'Onsen', 'Nature', 'Resort'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/260505_Moto-Hakone_Hakone_Japan01s3.jpg/960px-260505_Moto-Hakone_Hakone_Japan01s3.jpg',
  overview: 'A popular hot spring resort west of Tokyo with sweeping views of Mt. Fuji over Lake Ashi. Easily accessible from Tokyo, it offers everything from art museums to cable cars.',
  access: 'About 85 min from Shinjuku on the Odakyu Romance Car to Hakone-Yumoto. About 35 min from Tokyo to Odawara by Shinkansen, then transfer to Odakyu.',
  highlights: ['Lake Ashi with Mt. Fuji view', 'Hakone Ropeway (Owakudani volcanic valley)', 'Hakone Open-Air Museum', 'Hakone Shrine', 'Hakone-Yumoto hot spring area', 'Sengokuhara pampas grass fields (autumn)'],
  food: ['Black eggs (Owakudani specialty)', 'Wagashi sweets in Hakone-Yumoto', 'Mountain Hotel afternoon tea', 'Farm-to-table mountain cuisine'],
  memo: 'The Hakone Free Pass covers unlimited travel on all area transport — great value. Weekend road traffic is heavy; train travel is recommended.',
});

// Japan — Kansai (3 notes)
travel({
  folder: 'Asia', subfolder: 'Japan/Kansai', title: 'Kyoto',
  tags: ['Asia', 'Japan', 'Kansai', 'Kyoto', 'UNESCO', 'History', 'Temples-Shrines'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/960px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg',
  overview: 'Japan\'s ancient imperial capital for over a millennium. Seventeen UNESCO World Heritage Sites, traditional geisha culture, and some of Japan\'s finest cuisine make it unmissable.',
  access: 'About 2h 15min from Tokyo by Shinkansen (Nozomi). 30–45 min from Osaka by JR, Hankyu, or Kintetsu. Kyoto Station is the main hub.',
  highlights: ['Kinkaku-ji (Golden Pavilion)', 'Arashiyama bamboo grove', 'Fushimi Inari Taisha (thousands of torii gates)', 'Kiyomizu-dera', 'Gion & Hanamikoji (geisha district)', 'Philosopher\'s Path (cherry blossoms & autumn leaves)', 'Nijo Castle'],
  food: ['Yudofu (hot tofu, near Nanzenji)', 'Kaiseki multi-course cuisine', 'Nishiki Market street food', 'Matcha sweets', 'Obanzai (Kyoto home-style cuisine)'],
  memo: 'Spring (cherry blossoms, March–April) and autumn (foliage, November) bring crowds and high hotel prices. A bus/subway day pass is convenient. Don\'t miss Gion Matsuri in July.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Kansai', title: 'Osaka',
  tags: ['Asia', 'Japan', 'Kansai', 'Osaka', 'Food', 'Entertainment'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Osaka_Castle_03bs3200.jpg/960px-Osaka_Castle_03bs3200.jpg',
  overview: 'Japan\'s kitchen — a lively metropolis known for its street food culture, down-to-earth locals, and non-stop entertainment. Also home to Universal Studios Japan.',
  access: 'About 2h 30min from Tokyo by Shinkansen (Nozomi). Shin-Osaka Station is the Shinkansen hub. Umeda and Namba are the main entertainment districts.',
  highlights: ['Dotonbori (Glico sign, Ebisu Bridge)', 'Osaka Castle', 'Universal Studios Japan', 'Kuromon Market (Osaka\'s Kitchen)', 'Shinsekai & Tsutenkaku Tower', 'Shinsaibashi & Amerika-mura'],
  food: ['Takoyaki (octopus balls)', 'Kushikatsu (Shinsekai-style skewers)', 'Okonomiyaki (savory pancakes)', 'Kani Doraku crab cuisine', '551 Horai pork buns', 'Kinryu Ramen'],
  memo: 'ICOCA is the handy IC transit card for the Kansai region. The Osaka Amazing Pass offers great value. Dotonbori and Kuromon Market are the best street food zones.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Kansai', title: 'Nara',
  tags: ['Asia', 'Japan', 'Kansai', 'Nara', 'UNESCO', 'History', 'Nature'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Nara_Park_-_panoramio_%282%29.jpg/960px-Nara_Park_-_panoramio_%282%29.jpg',
  overview: 'Japan\'s ancient capital from 710–784 AD. Nara Park\'s freely roaming deer share the grounds with some of Japan\'s oldest and most magnificent temples.',
  access: 'About 35–45 min from Kyoto by Kintetsu or JR. About 35 min from Osaka by Kintetsu. Nara and Kintetsu-Nara Stations are the main entry points.',
  highlights: ['Todai-ji Great Buddha Hall (National Treasure & UNESCO)', 'Deer in Nara Park', 'Kasuga Grand Shrine (UNESCO)', 'Kofuku-ji Five-Story Pagoda', 'Gango-ji Temple', 'Naramachi historic district'],
  food: ['Kakinoha-zushi (mackerel sushi wrapped in persimmon leaf)', 'Miwa somen noodles', 'Nara-zuke pickles', 'Mitarashi dango (near Nara Park)', 'Daibutsu Pudding'],
  memo: 'The main sights are walkable. Deer crackers (¥150) are irresistible to the deer. Early morning at Todai-ji is quiet and magical.',
});

// Japan — Hokkaido (2 notes)
travel({
  folder: 'Asia', subfolder: 'Japan/Hokkaido', title: 'Hakodate',
  tags: ['Asia', 'Japan', 'Hokkaido', 'Food', 'Night View', 'History'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hakodate-panorama.jpg/960px-Hakodate-panorama.jpg',
  overview: 'A port city at the southern tip of Hokkaido, famous for one of the world\'s top three night views from Mt. Hakodate and an abundance of fresh seafood. Colonial-era Western architecture gives it a unique charm.',
  access: 'About 4 hours from Tokyo by Shinkansen (Hokkaido Shinkansen). About 1h 20min by plane. About 20 min from Hakodate Airport to the city center.',
  highlights: ['Night view from Mt. Hakodate (go at dusk)', 'Motomachi Western-style architecture district', 'Goryokaku fortress and tower', 'Morning Market (seafood donburi and squid sashimi)', 'Trappistine Convent'],
  food: ['Seafood donburi at the morning market', 'Squid dishes (ikameshi)', 'Shio ramen (light salt broth)', 'Lucky Pierrot\'s Chinese Chicken Burger', 'Hasegawa Store\'s grilled chicken bento'],
  memo: 'The ropeway gets very busy — grab a timed ticket early. Night views are best on clear days. The JR Hokkaido Pass is good value for getting around.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Hokkaido', title: 'Furano',
  tags: ['Asia', 'Japan', 'Hokkaido', 'Nature', 'Flower Fields', 'season:Summer'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%282%29.jpg/960px-%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%282%29.jpg',
  overview: 'Located in central Hokkaido, Furano\'s rolling hills burst into vivid purple lavender fields each July, drawing visitors from around the world. In winter, it\'s one of Japan\'s premier ski resorts.',
  access: 'About 2 hours from Sapporo on the seasonal Furano Lavender Express (summer only). About 1 hour by car from Asahikawa. Rental car is the most convenient.',
  highlights: ['Farm Tomita lavender fields (peak in July)', 'Rainbow fields of seasonal flowers', 'Views of the Tokachidake mountain range', 'Shirogane Blue Pond (Biei)', 'Filming locations from drama "Kita no Kuni Kara"'],
  food: ['Furano melon', 'Lavender soft-serve ice cream', 'Furano Burger', 'Local vegetable buffet', 'Furano wine'],
  memo: 'Lavender peaks mid-July. Cycling is possible but distances are significant — a rental car is most efficient.',
});

// Japan — Kyushu (2 notes)
travel({
  folder: 'Asia', subfolder: 'Japan/Kyushu', title: 'Nagasaki',
  tags: ['Asia', 'Japan', 'Kyushu', 'Nagasaki', 'History', 'Night View', 'Exotic'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg/960px-Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg',
  overview: 'Japan\'s only open trading port during the Edo period, Nagasaki has a uniquely multicultural heritage shaped by Chinese, Dutch, and Portuguese influences. Home to Glover Garden and the moving Peace Memorial.',
  access: 'About 1h 50min by plane from Tokyo. About 2 hours from Hakata by limited express (reduced after the Nishi-Kyushu Shinkansen opened).',
  highlights: ['Glover Garden (World Cultural Heritage)', 'Gunkanjima (Battleship Island) boat tour', 'Peace Park and Atomic Bomb Museum', 'Night view from Mt. Inasa', 'Dejima (Dutch Trading Post)', 'Lantern Festival (February)'],
  food: ['Champon noodles', 'Sara udon (crispy noodles with toppings)', 'Toruko rice (a Nagasaki fusion dish)', 'Castella sponge cake (Fukusaya, Bunmeido)', 'Kakuni-man (braised pork bun)'],
  memo: 'Gunkanjima landings depend on weather and require advance booking. Streetcars (¥140 per ride) are the easiest way to get around.',
});

travel({
  folder: 'Asia', subfolder: 'Japan/Kyushu', title: 'Beppu',
  tags: ['Asia', 'Japan', 'Kyushu', 'Oita', 'Onsen', 'Nature'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Beppu_Montage_2.jpg/960px-Beppu_Montage_2.jpg',
  overview: 'Japan\'s undisputed hot spring capital — more sources and greater output than anywhere else in the country. Steam rises from streets and alleyways throughout this unique city.',
  access: 'About 60 min by bus from Oita Airport. About 2 hours from Hakata by the limited express Sonic. Beppu Station is the main hub.',
  highlights: ['Beppu Hell Tour (Umi Jigoku, Chi-no-Ike Jigoku, and 5 more)', 'Communal baths in Beppu and Kannawa onsen areas', 'Takegawara Onsen (Meiji-era bathhouse)', 'Takasakiyama Natural Animal Park (wild monkeys)', 'Yufuin (30 min by car)'],
  food: ['Jigoku Mushi (food steamed in natural hot spring vapor)', 'Tori-ten (deep-fried chicken)', 'Dango-jiru (miso soup with flat dumplings)', 'Seki-saba & Seki-aji (premium mackerel and horse mackerel)', 'Beppu cold noodles (reimen)'],
  memo: 'The Hell Tour combined ticket (¥2,200) is great value. The "Beppu Hatto Onsen-do" challenge — visiting 88 different baths — is how locals enjoy the city.',
});

// Europe (3 notes)
travel({
  folder: 'Europe', title: 'Paris',
  tags: ['Europe', 'France', 'Art-Culture', 'Food', 'History'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/960px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  overview: 'The City of Light — one of the world\'s greatest capitals for art, fashion, and gastronomy. Iconic landmarks and world-class museums are concentrated in a walkable, beautiful city.',
  access: 'About 14 hours direct from Tokyo. RER B from Charles de Gaulle Airport reaches central Paris in about 35 minutes.',
  highlights: ['Eiffel Tower (spectacular lit up at night)', 'Louvre Museum (Mona Lisa, Venus de Milo)', 'Champs-Élysées', 'Musée d\'Orsay (Impressionist collection)', 'Montmartre & Sacré-Cœur', 'Versailles Palace (day trip)'],
  food: ['Croissant & baguette from a local boulangerie', 'Escargot and foie gras', 'Steak frites', 'Macarons (Ladurée)', 'Crêpes (street stalls)', 'Wine and cheese'],
  memo: 'Museums require online advance booking. Watch out for pickpockets. A weekly metro pass is the most economical way to get around.',
});

travel({
  folder: 'Europe', title: 'Rome',
  tags: ['Europe', 'Italy', 'UNESCO', 'History', 'Art-Culture'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg/960px-Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg',
  overview: 'The Eternal City — an open-air museum with over 2,000 years of continuous history. Ancient ruins stand beside Baroque fountains and Renaissance basilicas in every neighborhood.',
  access: 'About 13 hours direct from Tokyo. The Leonardo Express train from Fiumicino Airport reaches Roma Termini in about 30 minutes.',
  highlights: ['Colosseum (ancient Roman amphitheater)', 'Vatican City (St. Peter\'s Basilica & Sistine Chapel)', 'Trevi Fountain (toss a coin!)', 'Spanish Steps', 'Pantheon', 'Roman Forum'],
  food: ['Roman-style carbonara (no cream!)', 'Cacio e pepe', 'Pizza Margherita', 'Gelato', 'Spritz (aperitivo hour)', 'Tiramisù'],
  memo: 'Vatican Museums and the Colosseum both require advance reservations (expect long queues otherwise). Summer is intense — plan major sites for the morning.',
});

travel({
  folder: 'Europe', title: 'Barcelona',
  tags: ['Europe', 'Spain', 'Architecture', 'Food', 'Beach'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg/960px-Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg',
  overview: 'Capital of Catalonia and home to Gaudí\'s extraordinary architecture. A vibrant Mediterranean city blending world-famous modernist buildings with a relaxed beach lifestyle and outstanding food.',
  access: 'About 13–14 hours from Tokyo via Madrid or direct. About 30 minutes from El Prat Airport to the city center.',
  highlights: ['Sagrada Família (Gaudí\'s masterpiece — completion expected 2026)', 'Park Güell', 'Casa Batlló', 'Las Ramblas', 'Barceloneta Beach', 'Palau de la Música Catalana'],
  food: ['Tapas bar-hopping', 'Seafood paella', 'Pintxos (Basque-style bites)', 'Catalan cuisine (escalivada)', 'Sangria', 'Crema catalana'],
  memo: 'Sagrada Família requires advance online booking — do this before your trip. Pickpockets are common on Las Ramblas. Embrace the late-night bar culture.',
});

// Asia — non-Japan (4 notes)
travel({
  folder: 'Asia', title: 'Bangkok',
  tags: ['Asia', 'Thailand', 'Food', 'Temples', 'Shopping'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg/960px-01-%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B9%80%E0%B8%9A%E0%B8%8D%E0%B8%88%E0%B8%A1%E0%B8%9A%E0%B8%9E%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B8%94%E0%B8%B8%E0%B8%AA%E0%B8%B4%E0%B8%95%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A7%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.jpg',
  overview: 'Thailand\'s electrifying capital — a city of ornate temples, chaotic markets, and some of the world\'s best street food. Affordable, accessible, and endlessly stimulating.',
  access: 'About 7 hours direct from Tokyo. Airport Rail Link from Suvarnabhumi Airport reaches central Bangkok in about 30 minutes.',
  highlights: ['Grand Palace and Wat Phra Kaew (Temple of the Emerald Buddha)', 'Wat Pho (Giant Reclining Buddha)', 'Wat Arun (Temple of Dawn)', 'Khaosan Road (backpacker hub)', 'Chatuchak Weekend Market', 'Chao Phraya River cruise'],
  food: ['Pad Thai', 'Tom Yum Goong', 'Green curry', 'Khao Man Gai (chicken rice)', 'Mango sticky rice', 'Seafood at street stalls'],
  memo: 'Rainy season (May–Oct) brings sudden downpours. Modest clothing required at temples. Always confirm the taxi meter is running.',
});

travel({
  folder: 'Asia', title: 'Taipei',
  tags: ['Asia', 'Taiwan', 'Food', 'Shopping', 'Night Markets'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Taipei_Skyline_2022.06.29.jpg/960px-Taipei_Skyline_2022.06.29.jpg',
  overview: 'Taiwan\'s vibrant capital — Japan-friendly, affordable, and full of culinary surprises. Night markets, the National Palace Museum, and the mountain town of Jiufen make it a perfect short trip.',
  access: 'About 3h 30min direct from Tokyo. MRT from Taoyuan International Airport reaches central Taipei in about 35 minutes.',
  highlights: ['Taipei 101 (observation deck)', 'National Palace Museum (4,000 years of Chinese treasures)', 'Jiufen (nostalgia-drenched hilltop town)', 'Shilin & Ningxia Night Markets', 'Longshan Temple', 'Maokong Gondola'],
  food: ['Xiaolongbao soup dumplings (Din Tai Fung)', 'Beef noodle soup', 'Bubble tea (boba)', 'Lu rou fan (braised pork rice)', 'Pepper buns', 'Stinky tofu (worth trying!)'],
  memo: 'The MRT is safe, cheap, and efficient. The EasyCard works on all transit and at convenience stores. Japanese is often understood — locals are famously friendly.',
});

travel({
  folder: 'Asia', title: 'Bali',
  tags: ['Asia', 'Indonesia', 'Resort', 'Nature', 'Culture'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Tanah_Lot%2C_Bali%2C_Indonesia%2C_20220827_0957_1103.jpg/960px-Tanah_Lot%2C_Bali%2C_Indonesia%2C_20220827_0957_1103.jpg',
  overview: 'The Island of the Gods — Bali\'s Hindu culture, lush rice terraces, and world-class surf beaches make it one of the world\'s most beloved resort destinations.',
  access: 'About 7 hours direct from Tokyo. Taxi from Ngurah Rai International Airport to major areas takes 20–60 minutes depending on traffic.',
  highlights: ['Tegallalang Rice Terraces (Ubud)', 'Tanah Lot Temple (sea temple at sunset)', 'Kuta & Seminyak beaches', 'Balinese Hindu ceremonies and Ogoh-ogoh (March)', 'Ubud artist villages', 'Kopi Luwak coffee plantation tours'],
  food: ['Nasi goreng (fried rice)', 'Mie goreng (fried noodles)', 'Babi guling (spit-roast suckling pig)', 'Satay skewers', 'Smoked duck (bebek betutu)', 'Fresh tropical fruit juices'],
  memo: 'Each area has a distinct vibe: Ubud = culture & wellness; Kuta = lively & surfy; Seminyak = stylish & upscale. Take care on rental scooters — traffic can be unpredictable.',
});

travel({
  folder: 'Asia', title: 'Seoul',
  tags: ['Asia', 'Korea', 'Food', 'Shopping', 'K-POP'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg/960px-%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg',
  overview: 'South Korea\'s dynamic capital blends Joseon-dynasty palaces with cutting-edge K-pop culture, street food lanes, and 24-hour nightlife. One of the closest foreign destinations from Japan.',
  access: 'About 2h 30min direct from Tokyo. AREX express train from Incheon Airport reaches Seoul Station in about 45 minutes.',
  highlights: ['Gyeongbokgung Palace (Joseon era)', 'Myeongdong (shopping & street food)', 'Hongdae (student art & music scene)', 'Bukchon Hanok Village (traditional houses)', 'N Seoul Tower (Namsan)', 'Dongdaemun Design Plaza (DDP)'],
  food: ['Samgyeopsal (grilled pork belly)', 'Bibimbap', 'Tteok-galbi (short rib patties)', 'Korean fried chicken & beer (chimaek)', 'Tteokbokki (spicy rice cakes)', 'Naengmyeon (cold buckwheat noodles)', 'Cheese hot dog'],
  memo: 'T-money card works on all subway and buses. No visa needed for stays up to 90 days. Money exchange in the city offers better rates than the airport.',
});

// Others (3 notes)
travel({
  folder: 'Others', title: 'New York City',
  tags: ['USA', 'Entertainment', 'Art-Culture', 'Food'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/960px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
  overview: 'America\'s greatest city — a 24-hour metropolis of world-class museums, Broadway theater, and an endlessly diverse food scene. Everything feels bigger and more alive here.',
  access: 'About 13 hours direct from Tokyo. JFK or Newark airport to Manhattan takes about 1 hour by AirTrain + subway.',
  highlights: ['Statue of Liberty (ferry trip)', 'Central Park', 'Metropolitan Museum of Art (The Met)', 'Broadway musicals', 'Times Square', 'Brooklyn Bridge', 'Manhattan skyline at night'],
  food: ['New York-style pizza (one slice, folded)', 'Bagels (H&H Bagels)', 'Clam chowder', 'Cheeseburger (Shake Shack)', 'Eggs Benedict (weekend brunch)', 'Doughnuts (Doughnut Plant)'],
  memo: 'Tipping culture: 15–20% at restaurants. The subway runs 24 hours. Apply for ESTA well in advance (~$21).',
});

travel({
  folder: 'Others', title: 'Honolulu (Hawaii)',
  tags: ['USA', 'Resort', 'Nature', 'Food', 'Shopping'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2022_Views_from_Diamond_Head_02.jpg/960px-2022_Views_from_Diamond_Head_02.jpg',
  overview: 'A Pacific paradise beloved by Japanese travelers. Waikiki\'s golden beach, Diamond Head hikes, Hawaiian culture, and year-round sunshine make it one of the world\'s ultimate resort destinations.',
  access: 'About 7–8 hours direct from Tokyo. Daniel K. Inouye International Airport is about 20–30 min from Waikiki by bus or taxi.',
  highlights: ['Waikiki Beach (surfing, swimming)', 'Diamond Head Trail (early morning hike for sunrise)', 'Pearl Harbor National Memorial', 'Polynesian Cultural Center', 'North Shore waves in winter', 'Maui (Haleakalā crater)'],
  food: ['Loco moco', 'Poke bowl', 'Malasadas (Leonard\'s Bakery)', 'Garlic shrimp (North Shore)', 'Hawaiian plate lunch', 'Kona coffee'],
  memo: 'ESTA required ($21). Use "reef-safe" sunscreen — Oahu has banned coral-damaging chemicals. ABC Stores are convenient 24-hour shops throughout Waikiki.',
});

travel({
  folder: 'Others', title: 'Sydney',
  tags: ['Australia', 'Nature', 'City', 'Resort'],
  photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/960px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg',
  overview: 'Australia\'s largest city, a stunning harbour metropolis of iconic architecture, world-class beaches, and a laid-back outdoor lifestyle. The Opera House and Harbour Bridge are global icons.',
  access: 'About 9–10 hours direct from Tokyo. Train from Sydney Airport reaches Central Station in about 15 minutes.',
  highlights: ['Sydney Opera House (UNESCO)', 'BridgeClimb Harbour Bridge (ticketed experience)', 'Bondi Beach (surfing mecca)', 'Taronga Zoo (koalas & kangaroos)', 'Blue Mountains National Park (day trip)', 'Darling Harbour'],
  food: ['Barramundi (premium Australian fish)', 'Fish & chips', 'Brunch culture (avocado toast, smoothie bowls)', 'Tim Tams (chocolate biscuits)', 'Lamb dishes'],
  memo: 'Southern hemisphere = opposite seasons (Dec–Feb is summer). The Opal Card covers buses, ferries, and trains. An ETA visa is required — apply in advance.',
});

// ===== BOOK NOTES (20 notes) =====

// Business (8 notes)
book({
  folder: 'Business',
  title: 'The 7 Habits of Highly Effective People',
  author: 'Stephen R. Covey',
  tags: ['Business', 'Self-Help', 'rating:5', 'read:2024'],
  overview: 'A timeless framework for personal and professional effectiveness built on seven habits — moving from dependence to independence to interdependence. The "inside-out" philosophy makes it a genuine classic.',
  insights: [
    'Inside-out: real change starts with internal transformation, not external circumstances',
    'Be proactive: choose your response between stimulus and reaction',
    'Begin with the end in mind: write your personal mission statement',
    'Invest in Quadrant 2 (important but not urgent) — it\'s the only sustainable way to work',
    'Think Win-Win: collaboration expands the total pie rather than fighting over slices',
    'Seek first to understand, then to be understood',
  ],
  quote: 'The ability to choose your response is the greatest freedom given to human beings.',
  learning: 'The concept of a gap between stimulus and response was transformative. I now consciously practice pausing before reacting — and it has changed how I handle conflict.',
});

book({
  folder: 'Business',
  title: 'Zero to One',
  author: 'Peter Thiel',
  tags: ['Business', 'Entrepreneurship', 'Startups', 'rating:5', 'read:2024'],
  overview: 'PayPal and Palantir co-founder Peter Thiel\'s contrarian startup philosophy, distilled from his Stanford lectures. The central argument: monopoly, not competition, is the goal.',
  insights: [
    'Going from 0 to 1 (creating something new) beats 1 to n (copying what already exists)',
    'Competition is for losers — monopolies generate all the long-term profits',
    'A truly great technology must be 10x better than the next best alternative',
    'Start by dominating a small niche, then expand outward',
    'Power law: a handful of investments generate all meaningful returns',
    'Seek secrets — opportunities in truths that others haven\'t yet recognized',
  ],
  quote: 'Competition is for losers.',
  learning: 'The question "Am I improving what exists, or creating something new?" now guides how I evaluate product ideas. Zero-to-one thinking applies to freelance work too — find the gap nobody is filling.',
});

book({
  folder: 'Business',
  title: 'The Lean Startup',
  author: 'Eric Ries',
  tags: ['Business', 'Entrepreneurship', 'Product Development', 'rating:4', 'read:2023'],
  overview: 'A methodology for building new businesses through rapid experimentation, validated learning, and the Build-Measure-Learn feedback loop. The concept of the MVP (Minimum Viable Product) is central.',
  insights: [
    'Build an MVP to test your hypothesis as fast as possible',
    'The Build-Measure-Learn cycle should be completed as fast as you can',
    'Innovation accounting: track actionable metrics, not vanity metrics',
    'Pivot vs. persevere: use data to make the decision, not intuition alone',
    'Customer development interviews break you out of your assumptions',
  ],
  quote: 'A successful startup is one that has not merely survived, but learned — over and over — what customers actually need.',
  learning: 'I now apply "validate before you build" to every new portfolio project. A quick prototype test saves weeks of wasted effort.',
});

book({
  folder: 'Business',
  title: 'The Hard Thing About Hard Things',
  author: 'Ben Horowitz',
  tags: ['Business', 'Management', 'Leadership', 'rating:5', 'read:2024'],
  overview: 'A raw, honest account of the brutal realities of building and running a startup, by the co-founder of Andreessen Horowitz. No platitudes — just war stories and hard-won lessons.',
  insights: [
    'Peacetime CEO vs. Wartime CEO: leadership style must match the situation',
    'A culture that only hears good news will slowly destroy itself',
    'Transparency about hard truths builds more team trust than false reassurance',
    'Lay-offs must always be delivered directly by a manager — never by proxy',
    'Build scalable rules: verbal culture breaks down as companies grow',
  ],
  quote: 'The hard thing isn\'t dreaming big. The hard thing is waking up in the middle of the night in a cold sweat.',
  learning: 'This is the most honest book I\'ve read about the messy reality of leadership. Managing a small company or freelance practice, it\'s the gritty lessons that matter.',
});

book({
  folder: 'Business',
  title: 'Factfulness',
  author: 'Hans Rosling',
  tags: ['Business', 'Thinking', 'Data Literacy', 'rating:5', 'read:2023'],
  overview: 'Hans Rosling shows how the world is systematically better than we think, and explains the ten instincts that distort our perception. A compelling case for data-driven thinking.',
  insights: [
    'The world is improving on almost every measure — but our intuitions don\'t reflect that',
    'Ten instincts to watch for: Gap, Negativity, Straight Line, Fear, Size, Generalization, Destiny, Single Perspective, Blame, Urgency',
    'Always check the denominator when looking at numbers — ratios reveal what absolutes hide',
    'Develop a habit of verifying statistics yourself before accepting dramatic claims',
  ],
  quote: 'Letting go of a dramatic worldview does not mean giving up hope. It means replacing a false picture with a more accurate one.',
  learning: 'I now ask "what does the data actually say?" before forming an opinion. My decision-making quality has improved noticeably as a result.',
});

book({
  folder: 'Business',
  title: 'Influence: The Psychology of Persuasion',
  author: 'Robert B. Cialdini',
  tags: ['Business', 'Marketing', 'Psychology', 'rating:4', 'read:2023'],
  overview: 'The definitive text on the six principles of influence (Reciprocity, Commitment, Social Proof, Liking, Authority, Scarcity) — why people say yes, and how these triggers are used by marketers and negotiators.',
  insights: [
    'Reciprocity: we feel compelled to return favors — free gifts create powerful obligations',
    'Social proof: we look to what others do when uncertain about what to do ourselves',
    'Authority: credentials and titles bypass critical thinking in most people',
    'Scarcity: we want what is rare or becoming unavailable',
    'Commitment & consistency: once we commit, we align behavior to match our stated position',
    'Liking: we are far more easily persuaded by people we like',
  ],
  quote: 'Automatic response patterns are triggered by specific features of the world — and these triggers are being exploited.',
  learning: 'I now analyze every marketing message I encounter for which principle it\'s using. Knowing the mechanisms makes you both more persuasive and more resistant.',
});

book({
  folder: 'Business',
  title: 'Blue Ocean Strategy',
  author: 'W. Chan Kim & Renée Mauborgne',
  tags: ['Business', 'Strategy', 'Marketing', 'rating:4', 'read:2024'],
  overview: 'A framework for creating uncontested market space — "Blue Oceans" — rather than competing in the bloody "Red Ocean" of existing markets. The ERRC grid and value innovation are the core tools.',
  insights: [
    'Make the competition irrelevant by creating a new market space, not by beating competitors',
    'Use the ERRC grid (Eliminate, Reduce, Raise, Create) to redesign your value proposition',
    'Converting non-customers into customers expands the total market',
    'Value innovation breaks the trade-off between differentiation and low cost',
    'Cirque du Soleil made the traditional circus irrelevant by combining it with theater',
  ],
  quote: 'Stop trying to beat the competition. Focus on making the competition irrelevant.',
  learning: 'Designing my freelance services, I now start from "what problem does nobody else solve?" rather than "how do I beat the competition?" The shift changes everything.',
});

book({
  folder: 'Business',
  title: 'High Output Management',
  author: 'Andrew S. Grove',
  tags: ['Business', 'Management', 'Leadership', 'rating:5', 'read:2024'],
  overview: 'The Intel CEO\'s definitive guide to managerial leverage — the origin of OKRs, and a masterclass in how to maximize team output through smart prioritization and 1-on-1s.',
  insights: [
    'Manager output = your own output + the output of your team',
    '1-on-1s exist for the employee\'s benefit — managers should mostly listen',
    'Focus on high-leverage activities: those that produce the most output per unit of time',
    'Decisions should be made by the person closest to the information',
    'Meetings are for decision-making, not for sharing information that could be an email',
  ],
  quote: 'The output of a manager is the output of the organizational units under their supervision or influence.',
  learning: 'I transformed my 1-on-1s from status updates into development conversations. My leverage as a team member comes from influencing others, not just my own output.',
});

// Fiction (6 notes)
book({
  folder: 'Fiction',
  title: 'The Devotion of Suspect X',
  author: 'Keigo Higashino',
  tags: ['Fiction', 'Mystery', 'Japanese Literature', 'rating:5', 'read:2024'],
  overview: 'A math genius sets up an airtight alibi for his neighbor, who has just killed her abusive ex-husband. A Galileo series masterpiece where you know the killer from page one — the mystery lies elsewhere.',
  insights: [
    'The inverted mystery structure (we know who did it; the puzzle is the crime itself) is brilliantly executed',
    'Mathematical precision applied to the geometry of a human alibi',
    'The final revelation recontextualizes everything and hits harder because of it',
    'What separates crime from devotion? The novel leaves the answer to you.',
  ],
  quote: 'Everything I do, I do for her. That is the only reason I have to live.',
  learning: 'I thought I was reading a mystery novel; by the end it felt like literary fiction. The questions it raises about sacrifice and love stayed with me for weeks.',
});

book({
  folder: 'Fiction',
  title: 'Convenience Store Woman',
  author: 'Sayaka Murata',
  tags: ['Fiction', 'Japanese Literature', 'Akutagawa Prize', 'rating:4', 'read:2023'],
  overview: 'Keiko is 36, single, and has worked the same convenience store shift for 18 years. The Akutagawa Prize-winning novel uses her flat, logical perspective to expose the coercive conformity of Japanese society.',
  insights: [
    '"Normal" is a social construct — this novel makes that viscerally visible',
    'The protagonist\'s alien-like rationality holds up a mirror to the absurdity of social pressure',
    'A sharp critique of how Japan defines — and enforces — acceptable lives',
    'Short but constructed with perfect precision — not a wasted word',
  ],
  quote: 'I am listening to the convenience store. Its sounds, its air, its time. This is my world.',
  learning: 'It made me question whether I unconsciously pressure others to be "normal" — or whether I\'ve been pressured myself. One of the most thought-provoking novels I\'ve read.',
});

book({
  folder: 'Fiction',
  title: 'The Honeybee and the Thunder',
  author: 'Riku Onda',
  tags: ['Fiction', 'Japanese Literature', 'Naoki Prize', 'Music', 'rating:5', 'read:2024'],
  overview: 'Four gifted young pianists compete in an international competition. Onda\'s gift for writing music into language is staggering — you can hear the notes from the page. Winner of both the Naoki Prize and the Book of the Year Award.',
  insights: [
    'The language used to describe music pushes the boundaries of what prose can do',
    'Four contestants, four life philosophies: prodigy, grinder, veteran, late bloomer',
    'A competition about self-mastery as much as rivalry',
    'Reminds you what it means to be truly absorbed in something',
  ],
  quote: 'Music is vibrations in air. Yet those vibrations can shake the human soul and alter the world.',
  learning: 'I hadn\'t listened to classical music in years. After reading this, I spent the next month in Beethoven and Chopin. The best fiction makes you feel something beyond the book.',
});

book({
  folder: 'Fiction',
  title: 'The Mirror\'s Lonely Castle',
  author: 'Tsujimura Mizuki',
  tags: ['Fiction', 'Japanese Literature', 'Book of the Year', 'YA', 'rating:5', 'read:2023'],
  overview: 'Seven middle schoolers who have lost their place in the world are drawn into a magical castle inside a mirror. A warm, layered fantasy that speaks directly to loneliness, school avoidance, and the need to belong.',
  insights: [
    'Captures the universal pain of not belonging with precise, compassionate observation',
    'The plot structure — convergence of seemingly separate threads — is elegantly constructed',
    'Uses fantasy to say what realism might not allow: "You are not alone in this"',
    'Tackles bullying, school avoidance, and family dysfunction with sensitivity and seriousness',
  ],
  quote: 'This place is for you. Whatever the reason, you have every right to be here.',
  learning: 'A book for middle schoolers that left me, as an adult, feeling seen. The message that "your safe place exists somewhere" is one we all need.',
});

book({
  folder: 'Fiction',
  title: 'The Three-Body Problem',
  author: 'Liu Cixin (tr. Ken Liu)',
  tags: ['Fiction', 'Science Fiction', 'Chinese Literature', 'rating:5', 'read:2024'],
  overview: 'A landmark of Chinese science fiction. Starting during China\'s Cultural Revolution, it follows humanity\'s first contact with an alien civilization across an epic, scientifically rigorous trilogy. Hugo Award winner, now a Netflix series.',
  insights: [
    'The Dark Forest theory: in a universe of limited resources, intelligent civilizations are compelled to destroy each other — a chilling cosmological argument',
    'Fuses the Cultural Revolution\'s human horror with the vast horror of the cosmos',
    'The most hard-science fiction I\'ve read — orbital mechanics, astrophysics, game theory',
    'Forces the question: if humanity were to announce itself, should it?',
  ],
  quote: 'A civilization that reveals itself to the universe has issued its own death sentence.',
  learning: 'First time I felt genuinely afraid reading fiction — not from plot tension, but from the implications of the ideas. I went straight into the second and third volumes.',
});

book({
  folder: 'Fiction',
  title: 'I Want to Eat Your Pancreas',
  author: 'Yoru Sumino',
  tags: ['Fiction', 'Japanese Literature', 'Coming-of-Age', 'rating:4', 'read:2023'],
  overview: 'A quiet, withdrawn high school boy discovers his cheerful classmate is secretly terminally ill. Her final months, and their unlikely friendship, form the heart of this beautifully restrained debut novel.',
  insights: [
    'Explores "living" versus "waiting to die" through one character\'s relentless present-tense joy',
    'Questions what it means to truly connect with another person',
    'The unexpected ending deepens the themes rather than serving as a twist for its own sake',
    'Light prose with a long, resonant emotional afterglow',
  ],
  quote: 'I\'m not waiting to die. I\'m living as hard as I can right now.',
  learning: 'Reminded me to be present in ordinary days. The title keeps people away — don\'t let it keep you away.',
});

// Technical (6 notes)
book({
  folder: 'Technical',
  title: 'The Art of Readable Code',
  author: 'Dustin Boswell & Trevor Foucher',
  tags: ['Technical', 'Programming', 'Code Quality', 'rating:5', 'read:2023'],
  overview: 'A practical, example-driven guide to writing code that other people (and future you) can understand. Covers naming, comments, control flow, and simplifying logic — all with concrete before/after examples.',
  insights: [
    'Code is read far more often than it is written — readability is the most important quality',
    'Names should be precise, unambiguous, and concrete',
    'Comments should explain WHY, not WHAT — the code already says what',
    'Functions should do exactly one thing (single responsibility)',
    'Early returns flatten nesting and clarify intent',
  ],
  quote: 'Code should be written to minimize the time it would take for someone else to understand it.',
  learning: '"Is this readable?" is now my primary code review question. I regularly spend an extra minute on a variable name — and it\'s always worth it.',
});

book({
  folder: 'Technical',
  title: 'Designing Data-Intensive Applications',
  author: 'Martin Kleppmann',
  tags: ['Technical', 'Databases', 'Distributed Systems', 'rating:5', 'read:2024'],
  overview: 'The definitive guide to building reliable, scalable, and maintainable data systems. Covers replication, sharding, transactions, stream processing, and the deeper truths of distributed computing.',
  insights: [
    'Reliability, Scalability, and Maintainability are the three pillars of data systems',
    'Eventual consistency vs. ACID transactions: know when to use which',
    'Event sourcing and CQRS as patterns for building auditable, scalable systems',
    'The fundamental difficulty of consensus in distributed systems',
    'Batch processing and stream processing are more similar than they appear',
  ],
  quote: 'Data is the record of facts. But data systems are the interpretive apparatus that decides what those facts mean.',
  learning: 'My criteria for choosing between DynamoDB and Aurora became much clearer. I now start from "what do I need to guarantee?" not "what does my team already know?"',
});

book({
  folder: 'Technical',
  title: 'Domain-Driven Design',
  author: 'Eric Evans',
  tags: ['Technical', 'Software Design', 'Architecture', 'rating:4', 'read:2024'],
  overview: 'The original DDD text — a framework for modeling complex software systems around the business domain. Core concepts: Ubiquitous Language, Bounded Contexts, Entities, Value Objects, and Aggregates.',
  insights: [
    'Ubiquitous Language: developers and domain experts share a single vocabulary — no translations needed',
    'Bounded Contexts: draw explicit boundaries around each domain model to prevent concept bleed',
    'Entity vs. Value Object: does this thing have identity across time, or is it defined only by its attributes?',
    'Aggregates: the unit of consistency — changes happen within an aggregate, never across boundaries',
    'Anti-corruption Layer: prevent external system concepts from polluting your domain model',
  ],
  quote: 'The task of confronting the complexity of a domain and expressing that in a model is the central challenge of software design.',
  learning: 'When designing microservice boundaries in AWS, the Bounded Context concept is invaluable. It gives you a principled answer to "where do I draw the line?"',
});

book({
  folder: 'Technical',
  title: 'Kubernetes: Up and Running',
  author: 'Brendan Burns, Joe Beda & Kelsey Hightower',
  tags: ['Technical', 'Infrastructure', 'Containers', 'Kubernetes', 'rating:4', 'read:2023'],
  overview: 'A comprehensive Japanese-language guide to Kubernetes, covering Pods, Services, Deployments, Ingress, and more. Thorough explanations with practical examples for both beginners and practitioners.',
  insights: [
    'Pods are the smallest deployable unit — one or more containers sharing a network namespace',
    'Deployments manage replica count and rolling updates declaratively',
    'Services provide stable endpoints for ephemeral Pods',
    'ConfigMaps and Secrets decouple configuration from application code',
    'Always set resource requests and limits to protect node stability',
  ],
  quote: 'Kubernetes does not hide complexity — it makes the inherent complexity of infrastructure expressible and manageable.',
  learning: 'This book made EKS comprehensible. In production, I\'ve found that resource settings and Liveness/Readiness Probes are the first things that bite you if done wrong.',
});

book({
  folder: 'Technical',
  title: 'SQL Antipatterns',
  author: 'Bill Karwin',
  tags: ['Technical', 'Databases', 'SQL', 'rating:5', 'read:2023'],
  overview: '24 common SQL and schema design mistakes — with clear explanations of why they fail and what to do instead. Equally valuable for developers and DBAs.',
  insights: [
    'Naive Tree: use closure tables instead of adjacency lists for hierarchical data',
    'Multi-Column Attributes: never pack multiple values into a single column',
    'Index Shotgun: don\'t add indexes indiscriminately — measure their effect',
    'SQL Injection: always use parameterized queries — no exceptions',
    'EAV Pattern: ultra-flexible schemas create unmaintainable messes',
  ],
  quote: 'Every antipattern was once someone\'s well-intentioned solution to a real problem.',
  learning: 'Reviewing my past code, I found several of these patterns in production. I\'ve since used this book as a design review checklist on every new project.',
});

book({
  folder: 'Technical',
  title: 'Deep Learning from Scratch',
  author: 'Koki Saito',
  tags: ['Technical', 'Machine Learning', 'AI', 'Python', 'rating:5', 'read:2024'],
  overview: 'Build a deep learning library from the ground up using only Python and NumPy. The best way to truly understand neural networks — by implementing backpropagation, CNNs, and optimizers yourself.',
  insights: [
    'Computational graph visualization makes backpropagation intuitive',
    'Gradient descent: from numerical to analytical differentiation',
    'Mini-batch training balances memory efficiency and learning speed',
    'Batch Normalization and Dropout: what they actually do and why they work',
    'Implement a CNN and finally understand what convolution really means',
  ],
  quote: 'There are things you can only understand by building them yourself.',
  learning: 'Using Gemini API in my products, this book gave me a sense of what\'s actually happening inside. "Demystifying the black box" is the best description of what it does.',
});

console.log('✅ Sample vault (English) generated successfully');
