<script lang="ts">
    export let TTL: number;
    export let data: string;
</script>

<div class="border-l-2 border-green-800 pl-2 mb-2">
    <div class="flex items-center gap-2">
        <strong>TTL</strong>
        <span>{Math.floor(TTL / 60)} minutes</span>
    </div>
    <div class="flex items-center gap-2">
        <strong>DATA</strong>
        <span>{data}</span>
    </div>
</div>