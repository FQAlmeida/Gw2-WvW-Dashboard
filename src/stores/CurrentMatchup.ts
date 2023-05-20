import { writable, derived } from 'svelte/store';

interface WvwEndpointData {
    id: string,
    start_time: Date,
    end_time: Date,
    scores: { red: number, blue: number, green: number; },
    worlds: { red: number, blue: number, green: number; },
    all_worlds: {
        red: number[],
        blue: number[],
        green: number[],
    },
    deaths: { red: number, blue: number, green: number; },
    kills: { red: number, blue: number, green: number; },
    victory_points: { red: number, blue: number, green: number; },
    skirmishes: Array<{ id: number, scores: { red: number, blue: number, green: number; }; }>;
}

export const apiData = writable<WvwEndpointData[]>([]);

export const skirmishes = derived(apiData, ($apiData) => {
    return $apiData.map((matchup) => {
        return {
            id: matchup.id,
            start_time: matchup.start_time,
            end_time: matchup.end_time,
            skirmishes: matchup.skirmishes.sort((skirmish_1, skirmish_2) => {
                return skirmish_1.id - skirmish_2.id;
            })
        };
    });
});
