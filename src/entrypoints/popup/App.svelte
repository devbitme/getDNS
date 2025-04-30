<script lang="ts">
	import { Tabs } from "melt/builders";
	import { onMount } from "svelte";
	import DNSRecord from "../../components/DNSRecord.svelte";
	import { currentDomain, currentRecordType, dnsResponse, fetchDNSRecord } from "../../stores/dnsStore";

	const tabIds = ["A", "AAAA", "ANY", "CAA", "CNAME", "DNSKEY", "DS", "MX", "NS", "PTR", "SOA", "SRV", "TLSA", "TSIG", "TXT"];

	let value = $state(tabIds[0]);

	const tabs = new Tabs({
		value: value,
		selectWhenFocused: true,
		orientation: "horizontal",
		loop: true,
		onValueChange: (newValue) => {
			currentRecordType.set(newValue);
			fetchDNSRecord($currentDomain, newValue);
		}
	});

	// Get domain from current tab
	async function getCurrentTabDomain() {
		try {
			const tabs = await browser.tabs.query({
				currentWindow: true,
				active: true
			});

			if (tabs.length > 0 && tabs[0].url) {
				return new URL(tabs[0].url).hostname.replace("www.", "");
			}
			return "example.com";
		} catch (error) {
			console.error("Error getting current tab domain:", error);
			return "example.com";
		}
	}

	// Lifecycle management
	onMount(async () => {
		const domain = await getCurrentTabDomain();
		currentDomain.set(domain);

		// Fetch initial DNS record (A record)
		currentRecordType.set(tabIds[0]);
		await fetchDNSRecord(domain, tabIds[0]);

		// Focus first button of nav-dns after a delay
		const firstButton: HTMLElement | null = document.querySelector("#nav-dns button");
		if (firstButton) {
			firstButton.focus();
		}
	});
</script>

<main class="flex max-w-min flex-col p-4 text-[.8rem] select-none">
	<h1 class="sr-only">Get DNS</h1>

	<div class="text-center text-xl text-green-800 select-none">°˖✧◝(⁰▿⁰)◜✧˖°</div>

	<h2 class="my-2 text-center font-bold">{$currentDomain}</h2>

	{#each tabIds as id}
		<div {...tabs.getContent(id)} class="flex flex-col gap-4 border-b-2 border-green-800 py-4">
			{#if $dnsResponse.status === "loading" && $currentRecordType === id}
				<div class="text-center">Loading...</div>
			{:else if $dnsResponse.status === "error" && $currentRecordType === id}
				<div class="text-red-800">{$dnsResponse.message || "Record not found!"}</div>
			{:else if $dnsResponse.status === "success" && $currentRecordType === id && $dnsResponse.data}
				{#each $dnsResponse.data as record}
					<DNSRecord TTL={record.TTL} data={record.data} />
				{/each}
			{/if}
		</div>
	{/each}

	<div id="nav-dns" {...tabs.triggerList} class="mt-2 mb-4 flex gap-2">
		{#each tabIds as id}
			<button
				{...tabs.getTrigger(id)}
				class="cursor-pointer rounded border-1 border-white px-1 py-0 text-[.6rem] transition-colors hover:bg-green-200 hover:text-green-800 focus:ring-1 focus:ring-green-300 focus:ring-offset-1 focus:outline-0"
			>
				{id}
			</button>
		{/each}
	</div>

	<div class="absolute right-4 bottom-1 flex items-center gap-1 text-[.6rem] text-green-700 select-none">
		<a
			class="transition-opacity hover:opacity-75 focus:outline-0"
			href="https://devbit.me"
			title="devbit.me"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img src="devbitme.png" alt="logo devbitme" />
		</a>
		<div>
			getDNS <a
				class="font-bold transition-opacity hover:opacity-75 focus:outline-0"
				href="https://github.com/devbitme/getDNS/releases"
				target="_blank"
				rel="noopener noreferrer"
				title="Releases">1.0.1</a
			>
		</div>
	</div>
</main>

<style scoped>
	@reference "~/assets/tailwind.css";
	button[data-active] {
		@apply border-green-800 bg-green-200 text-green-800;
	}
</style>
