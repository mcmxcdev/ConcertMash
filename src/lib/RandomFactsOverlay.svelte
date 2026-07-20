<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  const randomFacts = [
    'In 2016, Mozart Sold More CDs than Beyoncé.',
    'The British Navy Uses Britney Spears Songs to Scare Off Pirates!',
    "The Offspring's First Drummer Left the Band to Become a Gynecologist",
    'The Longest Officially Released Song Is Over 13 Hours Long.',
    "Queen's 'Bohemian Rhapsody' Has No Chorus.",
    'Brian May of Queen Has a PhD in Astrophysics.',
    'A Cow Named Ermintrude Once Appeared on a Pink Floyd Album Cover.',
    "The 'Amen Break' Is a 6-Second Drum Solo Sampled in Thousands of Songs.",
    'Beethoven Was Completely Deaf When He Composed His Ninth Symphony.',
    'The Most Expensive Musical Instrument Ever Sold Was a Stradivarius Violin for $15.9 Million.',
    'Metallica Is the First Band to Have Played on All Seven Continents, Including Antarctica.',
    'Prince Played Every One of the 27 Instruments on His Debut Album.',
    'The Word "Music" Comes From the Greek "Mousike", Meaning "Art of the Muses".',
    'Listening to Music Releases Dopamine, the Same Chemical Linked to Food and Pleasure.',
    "The Beatles Used the Word 'Love' 613 Times Across Their Songs.",
  ];

  const randomFact =
    randomFacts[Math.floor(Math.random() * randomFacts.length)];
</script>

<div
  class="bg-ink/90 fixed top-0 right-0 bottom-0 left-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 backdrop-blur-sm"
>
  <div
    class="loader mb-6 h-12 w-12 rounded-full border-4 border-t-4 border-white/15 ease-linear"
  ></div>
  <h2
    class="text-spotify-hover-green mb-2 text-center text-sm font-bold tracking-widest uppercase"
  >
    Did you know?
  </h2>
  <p class="max-w-md text-center text-lg text-white">
    {randomFact}
  </p>
</div>
