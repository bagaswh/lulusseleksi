window.addEventListener('load', () => {
	const URL_API_DATA = window.location.href + 'api/hasil';
	const URL_API_DATA_SEARCH = window.location.href + 'api/hasil/search';
	const URL_API_UNIVERSITIES = window.location.href + 'api/universities';

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

				majorsGroup: {
					options: [
						{ value: null, text: 'Pilih kelompok prodi' },
						{ value: 1, text: 'SOSHUM' },
						{ value: 2, text: 'SAINTEK' },
					],
					value: null,
				},

				universities: {
					options: [{ value: null, text: 'Pilih universitas' }],
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
					key: 'uni_name',
					label: 'Universitas',
				},
				{
					key: 'major_name',
					label: 'Prodi',
				},
				{
					key: 'major_group',
					label: 'Kelompok prodi',
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
					this.getAndPopulateDataHasil();
				},
				deep: true,
			},

			'filters.selectionTypes': {
				handler(val) {
					this.getAndPopulateDataHasil();
				},
				deep: true,
			},

			'filters.majorsGroup': {
				handler(val) {
					this.getAndPopulateDataHasil();
				},
				deep: true,
			},

			'form.searchQuery': function (val) {
				this.getAndPopulateDataHasil();
			},
		},

		async created() {
			this.getAndPopulateDataHasil();
			await this.populateUniversities();

			this.$watch(
				'filters.universities',
				() => this.getAndPopulateDataHasil(),
				{ deep: true }
			);
		},

		methods: {
			mapFilterKeysToSearchQuery(key) {
				const map = {
					selectionTypes: 'test_type',
					minYear: 'year',
					page: 'page',
					pageSize: 'page_size',
					universities: 'univ.code',
					majorsGroup: 'majors.group',
				};
				return map[key];
			},

			getDataHasil() {
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

			getAndPopulateDataHasil() {
				this.states.isFetchingData = true;
				this.getDataHasil().then((data) => {
					this.data = this.transformData(data.records);
					this.paging.total = data.metadata.total_rows;

					this.states.isFetchingData = false;
				});
			},

			async populateUniversities() {
				const url = new URL(URL_API_UNIVERSITIES);
				let page = 1;
				let pageSize = 100;
				while (true) {
					url.searchParams.set('page', page);
					url.searchParams.set('page_size', pageSize);

					const json = await fetchJSON(url);
					this.filters.universities.options.push(
						...json.records.map((record) => ({
							value: record.code,
							text: record.name,
						}))
					);

					if (
						this.filters.universities.options.length >= json.metadata.total_rows
					) {
						break;
					}

					page++;
				}
			},

			transformData(data) {
				const testTypes = {
					1: 'SBMPTN',
					2: 'SNMPTN',
				};
				const majorGroups = {
					1: 'SOSHUM',
					2: 'SAINTEK',
				};
				return data.map((item) => ({
					...item,
					test_type: testTypes[item.test_type],
					major_group: majorGroups[item.major_group],
				}));
			},
		},
	});
});
