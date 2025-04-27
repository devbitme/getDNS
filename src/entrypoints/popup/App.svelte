<script lang="ts">
	import { Tabs } from "melt/components";
	import { onMount } from "svelte";

	const tabIds = ["A", "AAAA", "ANY", "CAA", "CNAME", "DNSKEY", "DS", "MX", "NS", "PTR", "SOA", "SRV", "TLSA", "TSIG", "TXT"];

	let domain: string = "example.com";
	let record: string = "Record not found!";

	// Function to update the record
	async function updateRecord(id: string, trigger: string) {
		const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${id}`);
		const data = await response.json();

		// format the record
		if (data.Answer) {
			record = data.Answer.map((item: any) => {
				return `
                <div class="border-l-2 border-green-800 pl-2">
                    <div class="flex items-center gap-2">
                        <strong>TTL</strong>
                        <span>${Math.floor(item.TTL / 60)} minutes</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <strong>DATA</strong>
                        <span>${item.data}</span>
                    </div>
                </div>
                `;
			}).join("");
			// focus the tab with svelte
			const tab: HTMLButtonElement | null = document.querySelector(`[id="${trigger}"]`);
			if (tab) {
				tab.focus();
			}
		} else {
			record = "Record not found!";
		}
	}

	// Get domain from current tab
	async function getCurrentTabDomain() {
		try {
			const tabs = await browser.tabs.query({
				currentWindow: true,
				active: true
			});
			if (tabs.length > 0) {
				const domain = new URL(tabs[0].url || "").hostname.replace("www.", "");
				return domain;
			}
		} catch (error) {
			return "example.com";
		}
	}

	// Lifecycle management
	onMount(async () => {
		domain = (await getCurrentTabDomain()) || "example.com";
		setTimeout(() => {
			const navDns = document.getElementById("nav-dns");
			if (navDns) {
				const buttons = navDns.querySelectorAll("button");
				buttons[0].focus();
			}
		}, 500);
	});
</script>

<main class="flex w-[600px] flex-col p-4 text-[.8rem] select-none">
	<h1 class="sr-only">Get DNS</h1>

	<div class="text-center text-xl text-green-800 select-none">°˖✧◝(⁰▿⁰)◜✧˖°</div>

	<h2 class="my-2 text-center font-bold">{domain}</h2>

	<Tabs value={tabIds[0]}>
		{#snippet children(tabs)}
			<!-- Content sections first -->
			{#each tabIds as id}
				<div {...tabs.getContent(id)} class="flex flex-col gap-4 border-b-2 border-green-800 py-4">
					{@html record}
				</div>
			{/each}

			<!-- Tab triggers below content -->
			<div id="nav-dns" {...tabs.triggerList} class="mt-2 mb-4 flex gap-2">
				{#each tabIds as id}
					<button
						{...tabs.getTrigger(id)}
						class="cursor-pointer rounded border-1 border-white px-1 py-0 text-[.6rem] transition-colors hover:bg-green-200 hover:text-green-800 focus:border-green-800 focus:bg-green-200 focus:text-green-800 focus:outline-0"
						on:focus={(event) => updateRecord(id, event.currentTarget.id)}
					>
						{id}
					</button>
				{/each}
			</div>
		{/snippet}
	</Tabs>

	<div class="absolute right-4 bottom-1 flex items-center gap-1 text-[.6rem] text-green-700 select-none">
		<a class="transition-opacity hover:opacity-75" href="https://devbit.me" title="devbit.me" target="_blank" rel="noopener noreferrer">
			<img src="devbitme.png" alt="logo devbitme" />
		</a>
		<div>
			getDNS <a
				class="font-bold transition-opacity hover:opacity-75"
				href="https://github.com/devbitme/getDNS/releases"
				target="_blank"
				rel="noopener noreferrer"
				title="Releases">1.0.0</a
			>
		</div>
	</div>
</main>
