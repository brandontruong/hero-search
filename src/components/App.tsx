import * as React from "react";
import axios from 'axios';
import * as _ from 'lodash';
import { AppProps, AppState, HeroItem, AppConfig, Aspect, KeyValuePair, AspectData } from "./AppProps";
const MAX_PRODUCTS_ITEM:number = 12;

export class App extends React.Component<AppProps, AppState> {
    constructor(props) {
		super(props);
		// set initial state:
		this.state = {
			totalNumber: 0,
			selectedTabIndex: 0,
			searchText: '',
			products: [],
			filters: [],
			filter1: '',
			filter2: '',
			filter3: '',
			isSearchResultShown: false,
			isSearchResultOver: false,
			categorySelectorDropdownOpen: false,
			filtersShown: false
		}; 
	}
	componentDidMount() {
		this.updateData(this.state.selectedTabIndex);
	}
    toggleCategorySelectorDropdown = () => {
		this.setState({ ...this.state, categorySelectorDropdownOpen: !this.state.categorySelectorDropdownOpen });
	}
	showFilters = () => {
		this.setState({ ...this.state, filtersShown: !this.state.filtersShown });
	}
	boldString = (str, find) => {
		if (str !== undefined) {
			return str.replace(new RegExp('('+find+')', 'gi'), '<strong>$1</strong>');
		}
		return '';
	} 
	onTabClicked = (e) => {
		const selectedTabIndex = parseInt(e.currentTarget.getAttribute('data-tab-id'), 0);
		this.updateData(selectedTabIndex);
		// trigger the tab change event
		$(document).trigger('heroSearchTabChanged', { name: e.currentTarget.text.trim(), index: selectedTabIndex});
		return false;
    };
    updateData = (selectedTabIndex) => {
		this.setState({ products: [], searchText: '', selectedTabIndex, categorySelectorDropdownOpen: false });
		const config: HeroItem = this.props.config.heroItems[selectedTabIndex];
		axios.get(this.constructEndpointUrl())
			.then(res => {
				const aspects = config.aspects
					.map(aspect => res.data.iNav.Nodes.find(node => node.Type === 'Aspect' && node.Name === aspect.name))
					.map(n => n.Facets.sort(this.sortString)
					.map(f => { return { key: f.DisplayValue, value: f.Expression }; })
					);
				this.setState({ totalNumber: res.data.Count, filters: aspects });
			});
	};
	sortString = (a, b) => {
		const nameA = a.DisplayValue.toLowerCase(); // ignore upper and lowercase
		const nameB = b.DisplayValue.toLowerCase(); // ignore upper and lowercase
		if (nameA < nameB) { return -1; }
		if (nameA > nameB) { return 1; }
		// names must be equal
		return 0;
	};
	mouseOutSuggesion = () => {
		this.setState({ isSearchResultOver: false });
	}
	mouseOverSuggesion = () => {
		this.setState({ isSearchResultOver: true });
	}
    hideSearchResult = () => {
		const {isSearchResultOver} = this.state;
		if (!isSearchResultOver)
		{
			this.setState({ isSearchResultShown: false });
		}
    }
    handleKeyPress = (e) => {
		this.setState({ searchText: e.target.value });
		if (e.key === 'Enter') {
			window.location.href = this.constructSearchString();
			return;
		}
    }
    constructSearchString = () => {
		const { searchText, filter1, filter2, filter3, selectedTabIndex } = this.state;
		const config: HeroItem = this.props.config.heroItems[selectedTabIndex];
		let filterQuery: string = '';
		if (filter1 !== '') {
			filterQuery += `_.` + filter1;
		}
		if (filter2 !== '') {
			filterQuery += `_.` + filter2;
		}
		if (filter3 !== '') {
			filterQuery += `_.` + filter3;
		}
		let query = '';
		if (searchText !== '') {
			query = `(And.All.keyword(` + searchText + `).` + filterQuery + ')';
		}
		else if (filterQuery !== '') {
			query += filterQuery.slice(2);
		}
		return config.searchResultUrl + query;
    }
    doSearch = () => {
		window.location.href = this.constructSearchString();
	}
	constructEndpointUrl = () => {
		const { searchText, filter1, filter2, filter3, selectedTabIndex } = this.state;
		const config: HeroItem = this.props.config.heroItems[selectedTabIndex];
		let filterQuery: string = '';
		if (filter1 !== '') {
			filterQuery += `_.` + filter1;
		}
		if (filter2 !== '') {
			filterQuery += `_.` + filter2;
		}
		if (filter3 !== '') {
			filterQuery += `_.` + filter3;
		}
		let query = '';
		if (searchText !== '') {
			query = `_.All.keyword(` + searchText + `).` + filterQuery;
		}
		else if (filterQuery !== '') {
			query += filterQuery.slice(2);
		}
		return config.endpointUrl.replace('{searchText}', searchText).replace('{querySearchText}', query);
	}
	doDebounceSearch = _.debounce(val => {
		const { searchText } = this.state;
		axios.get(this.constructEndpointUrl())
			.then(res => {
				if (res.data.FacetCompletions === 'Sequence contains no elements') {
					this.setState({ products: [], isSearchResultShown: false });					
				}
				else {
					let results = res.data.FacetCompletions;
					if  (res.data.FacetCompletions.length > MAX_PRODUCTS_ITEM)  {
						results = results.slice(0, MAX_PRODUCTS_ITEM);
					}
					const products = results.map(f => {
						return {name: this.boldString(f.Name, searchText) , expression: f.Expression, count: f.Count};
					});
					this.setState({ products: products, isSearchResultShown: true });
				}
			});
	}, 1000);
	doSearchText(event) {
		const val = event.target.value;
		this.setState({searchText: val}, () => {
			this.doDebounceSearch(val);
		});
	  }
    filterChange = (e) => {
		const selectedFilterIndex = parseInt(e.currentTarget.getAttribute('data-index'), 0);
		switch (selectedFilterIndex) {
			case 0:
				this.setState({ filter1: e.target.value.replace(/ /g, '+') });
				break;
			case 1:
				this.setState({ filter2: e.target.value.replace(/ /g, '+') });
				break;
			case 2:
				this.setState({ filter3: e.target.value.replace(/ /g, '+') });
				break;
			default:
				break;
		}
	}
    render() {
        const config: AppConfig = this.props.config;
		const state: AppState = this.state;
		const { filters, selectedTabIndex } = this.state;
		const selectedConfig: HeroItem = this.props.config.heroItems[selectedTabIndex];
		let subTitle = config.heroSearchTitle;
		const roundedDownTotalNumber = Math.floor(state.totalNumber/ 1000) * 1000 ;
		if (roundedDownTotalNumber === 0) {
			subTitle = subTitle.replace('{numberOfItems}', state.totalNumber.toLocaleString());
		}
		else {
			subTitle = subTitle.replace('{numberOfItems}', 'Over ' + roundedDownTotalNumber.toLocaleString());
		}
        return (
            <div className="hero-search">
                <div className="hero__content" >
                    <h4>{subTitle}</h4>
                    <div className="category-selector">
						<div className="category-selector-container">
							<div className="hero-tab-container">
								<button type="button"
									className={"btn btn-secondary dropdown-toggle" + ((state.categorySelectorDropdownOpen) ? ' show' : '')}
									id="category-selector-dropdown-menu" data-toggle="dropdown" aria-haspopup="true"
										aria-expanded={(state.categorySelectorDropdownOpen) ? 'true' : 'false'}
										onClick={ this.toggleCategorySelectorDropdown.bind(this) }>
										{ (state.selectedTabIndex === 0) &&
											<span><i className="picon picon_cars"></i>{selectedConfig.name}</span>
										}
										{ (state.selectedTabIndex === 1) &&
											<span><i className="picon picon_salvage"></i>{selectedConfig.name}</span>
										}
										{ (state.selectedTabIndex === 2) &&
											<span><i className="picon picon_industrial"></i>{selectedConfig.name}</span>
										}
										{ (state.selectedTabIndex === 3) &&
											<span><i className="picon picon_general-goods"></i>{selectedConfig.name}</span>
										}
								</button>
								<ul role="tablist" className="nav-pills">
									{config.heroItems.map((tab: any, index) => (
										<li key={'tab-list-' + index}>
											<a className={'nav-link' + ((state.selectedTabIndex === index) ? ' active' : '')}
												role="tab" data-toggle="tab" id={tab.name + '-tab'}
												onClick={this.onTabClicked.bind(this)} data-tab-id={index}
											>
												<span dangerouslySetInnerHTML={{ __html: tab.icon }} />
												{tab.name}
											</a>
										</li>
									))}
								</ul>
							</div>

							<div className="input-group" id="hero-search">
								<input className="form-control form-control-lg hero-input" placeholder="Search by make and model ..." type="text"
									value={state.searchText} onInput={this.doSearchText.bind(this)} onBlur={this.hideSearchResult.bind(this)}
									onKeyPress={this.handleKeyPress.bind(this)} />
								<span className="input-group-btn">
									<button className="btn hero-btn" type="button"
										onClick={this.doSearch.bind(this)}>
										<i className="fa fa-search mr-0" aria-hidden="true"></i>
									</button>
								</span>
								{(state.products.length > 0 && state.searchText !== undefined && state.searchText !== '' && state.isSearchResultShown) &&
									<div className="autocomplete-suggestions" onMouseOut={this.mouseOutSuggesion.bind(this)} 
										onMouseOver={this.mouseOverSuggesion.bind(this)} 
										>
										{state.products.map((product: AspectData, index) => (
											<div className="autocomplete-suggestion" key={'product' + index}>
												<a href={selectedConfig.searchResultUrl + `?q=` + product.expression}
													dangerouslySetInnerHTML={{__html: product.name + ' (' + product.count + ')'}}>
												</a>
											</div>
										))}
									</div>
								}
							</div>
							<div className={"hero-input-group" + ((state.filtersShown) ? ' show' : '')}>
								<div className="flex-block">
									{filters.map((filter: KeyValuePair[], index) => (
										<div key={'filter' + index}>
										{
											<select className="custom-select" onChange={this.filterChange.bind(this)} data-index={index}>
												<option key={'filter' + index + '_option'} value=''>{config.heroItems[state.selectedTabIndex].aspects[index].display}</option>
												{filter.map((f: KeyValuePair) => (
													<option key={'filter' + index + f.key} value={f.value}>{((index === 0) ? f.key.toUpperCase() : f.key)}</option>
												))}
											</select>
										}
										</div>
									))}
								</div>
							</div>
							<a href="javascript:;" className={"filter-link" + ((state.filtersShown) ? ' show-less-options' : '')}  onClick={this.showFilters.bind(this)}>
								<span className="less-options">
									Less options
									<i className="icon ion-arrow-up-b"></i>
								</span>
								<span className="more-options">
									More options
									<i className="icon ion-arrow-down-b"></i>
								</span>
							</a>
						</div>
					</div>
                </div>
            </div>
		);
    }
}