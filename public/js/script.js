window.addEventListener('load', () => {
	const URL_API_DATA = window.location.href + 'api/data';
	const URL_API_DATA_SEARCH = window.location.href + 'api/data/search';

	function fetchJSON(url, opts) {
		return fetch(url).then((res) => res.json());
	}

	Vue.mixin({
		methods: {
			formatNumber(number) {
				return numeral(number).format('0,0');
			},
		},
	});

	const app = new Vue({
		el: '#app',
		data: {
			filters: {
				selectionTypes: {
					options: [
						{ value: null, text: 'Pilih jenis seleksi' },
						{ value: 1, text: 'SBMPTN' },
						{ value: 2, text: 'SNMPTN' },
					],
					value: null,
				},
				minYear: {
					value: 2020,
				},
				maxYear: {
					value: 2020,
				},
			},

			paging: {
				page: 1,
				pageSize: 10,
				total: 0,
			},

			data: [],
			tableFields: [
				{
					key: 's_id',
					label: 'ID Siswa',
				},
				{
					key: 's_name',
					label: 'Nama',
				},
				{
					key: 'test_type',
					label: 'Jalur seleksi',
				},
				{
					key: 'major_id',
					label: 'Kode prodi',
				},
				{
					key: 'year',
					label: 'Tahun',
				},
			],

			states: {
				isFetchingData: false,
			},

			form: {
				searchQuery: '',
				searchExact: true,
			},
		},

		watch: {
			paging: {
				handler(val) {
					this.getAndPopulateData();
				},
				deep: true,
			},

			filters: {
				handler(val) {
					this.getAndPopulateData();
				},
				deep: true,
			},

			'form.searchQuery': function (val) {
				this.getAndPopulateData();
			},
		},

		created() {
			this.getAndPopulateData();
		},

		methods: {
			mapFilterKeysToSearchQuery(key) {
				const map = {
					selectionTypes: 'test_type',
					minYear: 'year',
					page: 'page',
					pageSize: 'page_size',
				};
				return map[key];
			},

			getData() {
				const url = new URL(
					this.form.searchQuery ? URL_API_DATA_SEARCH : URL_API_DATA
				);

				if (this.form.searchQuery) {
					url.searchParams.append('q', this.form.searchQuery);
					url.searchParams.append('exact', this.form.searchExact);
				}

				Object.entries({
					...this.filters,
					..._.pickBy(this.paging, (k, v) => v != 'total'),
				}).forEach(([key, value]) => {
					const mappedKey = this.mapFilterKeysToSearchQuery(key);
					const realValue = typeof value == 'object' ? value.value : value;
					if (!mappedKey || !realValue) {
						return;
					}
					if (typeof value == 'object') {
						url.searchParams.append(mappedKey, value.value);
					} else {
						url.searchParams.append(mappedKey, value);
					}
				});

				return fetchJSON(url);
			},

			getAndPopulateData() {
				this.states.isFetchingData = true;
				this.getData().then((data) => {
					this.data = this.transformData(data.records);
					this.paging.total = data.metadata.total_rows;

					this.states.isFetchingData = false;
				});
			},

			transformData(data) {
				const testTypes = {
					1: 'SBMPTN',
					2: 'SNMPTN',
				};
				return data.map((item) => ({
					...item,
					test_type: testTypes[item.test_type],
				}));
			},
		},
	});
});
