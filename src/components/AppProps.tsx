export const Icons = [
	`<i class="picon picon_cars"></i>`,
	`<i class="picon picon_salvage"></i>`,
	`<i class="picon picon_industrial"></i>`,
	`<i class="picon picon_general-goods"></i>`
];
export interface KeyValuePair {
	key: string;
	value: string;
}
export interface AppState  {
	totalNumber: number;
	selectedTabIndex: number,
	searchText: string;
	products: AspectData[],
	filters: KeyValuePair[][],
	filter1: string,
	filter2: string,
	filter3: string,
	isSearchResultShown: boolean,
	isSearchResultOver: boolean,
	categorySelectorDropdownOpen: boolean,
	filtersShown: boolean
};
export interface Aspect {
    name: string;
    display: string;
}
export interface AspectData {
	name: string;
	expression: string;
	count: number;
}
export interface HeroItem {
    name: string;
    productLine: string;
	icon: string;
	searchResultUrl: string;
	endpointUrl: string;
    aspects: Aspect[]
}
export interface AppConfig {
    numberOfHeroItemsDisplayed: number;
    heroSearchTitle: string;
    heroItems: HeroItem[];
}

const baseEndpointUrl: string = '/v4/caradvert/-public?inav=bc|ha|u&sr=true&count=true';

export const appConfig: AppConfig = {
    numberOfHeroItemsDisplayed: 6,
	heroSearchTitle: '{numberOfItems} items available.',
	heroItems: [
		{
			name: 'Vehicles',
			productLine: 'cars',
			icon: Icons[0],
			searchResultUrl: '/cars/item/search#!/search-result?q=',
			endpointUrl: baseEndpointUrl + '&fc={searchText}&q=(And.ProductLine.cars.{querySearchText})',
			aspects: [
				{ name: 'State', display: 'Location' },
				{ name: 'BuyMethod', display: 'Buy Method' },
				{ name: 'Body', display: 'Any Body' }
			]
		},
		{
			name: 'Salvage',
			productLine: 'salvage',
			icon: Icons[1],
			searchResultUrl: '/damaged-salvage/item/search#!/search-result?q=',
			endpointUrl: baseEndpointUrl + '&fc={searchText}&q=(And.ProductLine.salvage.{querySearchText})',
			aspects: [
				{ name: 'State', display: 'Location' },
				{ name: 'ProductType', display: 'Any Product Type' },
				{ name: 'Make', display: 'Any Make' }
			]
		},
		{
			name: 'Industrial',
			productLine: 'trucks',
			icon: Icons[2],
			searchResultUrl: '/trucks/item/search#!/search-result?q=',
			endpointUrl: baseEndpointUrl + '&fc={searchText}&q=(And.ProductLine.trucks.{querySearchText})',
			aspects: [
				{ name: 'State', display: 'Location' },
				{ name: 'ProductType', display: 'Any Product Type' },
				{ name: 'Make', display: 'Any Make' }
			]
		},
		{
			name: 'Goods',
			productLine: 'general',
			icon: Icons[3],
			searchResultUrl: '/general/item/search#!/search-result?q=',
			endpointUrl: baseEndpointUrl + '&fc={searchText}&q=(And.ProductLine.general.{querySearchText})',
			aspects: [
				{ name: 'State', display: 'Location' },
				{ name: 'ProductType', display: 'Any Product Type' },
				{ name: 'Make', display: 'Any Make' }
			]
		}
	]
};
export interface AppProps { config: AppConfig; }