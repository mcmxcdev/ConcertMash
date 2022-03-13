<script lang="ts">
  const didYouKnowFacts = [
    'In 2016, Mozart Sold More CDs than Beyoncé.',
    'The British Navy Uses Britney Spears Songs to Scare Off Pirates!',
    "The Offspring's First Drummer Left the Band to Become a Gynecologist",
  ];

  const randomFact =
    didYouKnowFacts[Math.floor(Math.random() * didYouKnowFacts.length)];
</script>

<div
  class="fixed top-0 left-0 right-0 bottom-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-900 opacity-75"
>
  <div
    class="loader mb-4 h-12 w-12 rounded-full border-4 border-t-4 border-gray-200 ease-linear"
  />
  <h2 class="text-center text-xl font-semibold text-white">Did you know?</h2>
  <p class="text-center text-white">
    {randomFact}
  </p>
</div>
