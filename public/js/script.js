window.addEventListener('load', () => {
	const URL_API_DATA = window.location.href + 'api/hasil';
	const URL_API_DATA_SEARCH = window.location.href + 'api/hasil/search';

	const URL_API_UNIVERSITIES = window.location.href + 'api/universities';
	const URL_API_UNIVERSITIES_SEARCH =
		window.location.href + 'api/universities/search';

	const URL_API_MAJORS = window.location.href + 'api/majors';
	const URL_API_MAJORS_SEARCH = window.location.href + 'api/majors/search';

	Vue.mixin({
		data: () => ({
			urls: {
				URL_API_UNIVERSITIES,
				URL_API_UNIVERSITIES_SEARCH,
				URL_API_MAJORS,
				URL_API_MAJORS_SEARCH,
			},
		}),

		methods: {
			formatNumber(number) {
				return numeral(number).format('0,0');
			},

			fetchJSON,
		},
	});

	Vue.component('v-select', VueSelect.VueSelect);
	Vue.component('infinite-select', InfiniteSelect);
	Vue.component('multicheckbox', MultiCheckbox);

	const app = new Vue({
		el: '#app',
		data: {
			filters: {
				selectionTypes: {
					options: [
						{ value: 1, label: 'SBMPTN' },
						{ value: 2, label: 'SNMPTN' },
					],
					value: null,
				},

				majorsGroup: {
					options: [
						{ value: 1, label: 'SOSHUM' },
						{ value: 2, label: 'SAINTEK' },
					],
					value: null,
				},

				majors: {
					options: [],
					value: null,
					transformer(data) {
						let currentUniCode = 0;
						const transformed = [];
						data
							.sort((a, b) => a.university_code - b.university_code)
							.forEach((item, index) => {
								if (item.university_code != currentUniCode) {
									currentUniCode = item.university_code;
									transformed.push({ header: item.university_name });
								}
								transformed.push({ label: item.name, value: item.code });
							});
						return transformed;
					},
				},

				universities: {
					options: [],
					value: null,
					transformer(data) {
						return data.map((item) => ({
							label: item.name,
							value: item.code,
						}));
					},
				},

				minYear: {
					value: 2020,
				},

				maxYear: {
					value: 2020,
				},
			},

			paging: {
				pages: [10, 25, 50, 75, 100, 200, 300],
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
			'paging.page': function () {
				this.getAndPopulateDataHasil();
			},

			'paging.pageSize': function () {
				this.getAndPopulateDataHasil();
			},

			filters: {
				handler() {
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
					majors: 'majors.code',
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
					if (Array.isArray(realValue)) {
						realValue.forEach((item) => {
							url.searchParams.append(mappedKey, item);
						});
					} else {
						url.searchParams.append(mappedKey, realValue);
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
