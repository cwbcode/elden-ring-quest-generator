async function main() {
  const res = await fetch('https://eldenring.fanapis.com/api/ashes?limit=100');
  const data = await res.json();
  const blindSpot = data.data.find((item: any) => item.name.includes('Blind Spot'));
  console.log(blindSpot);
}

main().catch(console.error);
