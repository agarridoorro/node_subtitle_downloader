/*******************************************************************************************************************/
var httpMixin = {
	data: function () {
		return {
			URL_EXPLORER: '/explorer/',
			URL_SUBTITLE: '/subtitle/'
		}
	},	
	methods: {
		get: function (url, queryString, action) {
			this.$refs.wait.show();
			axios.get(url, { params: queryString})
				 .then(action)
				 .catch(error => this.$refs.info.showError(error))
				 .finally(() => this.$refs.wait.hide())
		},
		patch: function (url, body, action) {
			this.$refs.wait.show();
			axios.patch(url, body)
				 .then(action)
				 .catch(error => this.$refs.info.showError(error))
				 .finally(() => this.$refs.wait.hide())
		},
		put: function (url, body, action) {
			this.$refs.wait.show();
			axios.put(url, body)
				 .then(action)
				 .catch(error => this.$refs.info.showError(error))
				 .finally(() => this.$refs.wait.hide())
		}
	}
}
/*******************************************************************************************************************/
$('#waitModal').modal({keyboard: false, backdrop:'static', show: false});
const WaitComponent = {
	template: `
<div>	
	<div class="modal" id="waitModal" tabindex="-2" role="dialog">
		<div class="modal-dialog modal-dialog-centered modal-sm" role="document">
			<div class="modal-content">
				<div class="modal-body center" style="margin: 0 auto;">
					<i class="fas fa-hourglass-half fa-3x" />
				</div>
			</div>
		</div>
	</div>	
</div>	
	`,
	methods: {
		show: function () {
			$('#waitModal').modal('show');
		},
		hide: function () {
			$('#waitModal').modal('hide');
		}
	}
};
/*******************************************************************************************************************/
$('#infoModal').modal({show: false});
const InfoComponent = {
	template: `
<div>	
	<div class="modal fade" id="infoModal" tabindex="-1" role="dialog">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{{isError ? "Error" : "Information"}}</h5>
				</div>
				<div class="modal-body">
					<div class="alert" :class="{'alert-danger': isError, 'alert-success': !isError}" role="alert">
						{{message}}
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>	
</div>	
	`,
    data: function() {
		return {
			isError: false,
			message: ''
		}
    },
	methods: {
		showMessage: function (message) {
			this.isError = false;
			this.message = message;
			$('#infoModal').modal('show')
		},
		showError: function (error) {
			this.isError = true;
			this.message = (error.response) ? error.response.data.error : error;
			$('#infoModal').modal('show')
		}
	}
};
/*******************************************************************************************************************/
const SyncComponent = {
  props: ['file'],
  template: `
<div v-if="file.isSubtitle">
	<br/>
	<div class="input-group mb-4">
		<div class="btn btn-dark" @click='change()'>
			<i class="fas fa-lg fa-exchange-alt" />
		</div>
		
		<div v-if="!showOffset">
			&nbsp;
			<div class="btn btn-dark" :class="{'disabled': !enablePlay}" @click="start()">
				<i class="fas fa-lg fa-play"></i>
			</div>
			<div class="btn btn-dark" :class="{'disabled': enablePlay}" @click="stop()">
				<i class="fas fa-lg fa-stop"></i>
			</div>
			&nbsp;
		</div>
		
		<input type="number" class="form-control" :value="millis" ref="inputMillis"
			:placeholder="showOffset ? 'offset (ms)' : 'init (ms)'"></input>
		
		<div class="btn btn-dark" @click="$emit('sync-subtitle', showOffset, $refs.inputMillis.value)">
			<i class="fas fa-lg fa-edit" />
		</div>
	</div>
</div>
	`,
    data: function () {
		return {
			showOffset: true,
			enablePlay: true,
			millis: null,
			init: 0
		}
    },
	methods: {
		change: function() {
			this.showOffset = !this.showOffset;
			this.millis = null;
		},
		start: function () {
			if (this.enablePlay) {
				this.enablePlay = false;
				this.millis = null;
				this.init = (new Date()).getTime();
			}
		},
		stop: function() {
			if (!this.enablePlay) {
				this.enablePlay = true;
				this.millis = ((new Date()).getTime() - this.init);
				this.init = 0;
			}
		}
	}
};
/*******************************************************************************************************************/
const SearchComponent = {
  props: ['file'],
  template: `
<div v-if="!file.isSubtitle">
	<br/>
	<div class="input-group mb-4">
		<input type="text" class="form-control" placeholder="Search text" :value="file.searchName" ref="inputSearch">
		<div class="btn btn-dark" @click="$emit('search-subtitle', $refs.inputSearch.value)">
			<i class="fas fa-lg fa-search" />
		</div>
	</div>
</div>
	`
};
/*******************************************************************************************************************/
const ExplorerComponent = {
	template: `
<div>
	<wait ref="wait" />
	<info ref="info"/>
	<div v-if="container">
		<h6>{{ container.name }}</h6>
		<br/>
		<div v-if="container.files.length" class="list-group">
			<div v-for="file in container.files">
				<div @click="select(file)" class="hand list-group-item"
					:class="{'list-group-item-light': !file.isFolder, 'list-group-item-secondary': file.isFolder}">
					
					<i class="fas fa-lg" :class="getIcon(file)" />
					{{ file.name }}
				</div>
				<div v-if="current == file">
					<sync :file="file" @sync-subtitle="onSyncSubtitle"></sync>
					<search :file="file" @search-subtitle="onSearchSubtitle"></search>
				</div>
			</div>
		</div>
		<div v-else>
			<h6>Empty directory.</h6>
		</div>
	</div>
</div>
	`,
	components: {
		'wait': WaitComponent,
		'info': InfoComponent,
		'sync': SyncComponent,
		'search': SearchComponent
	},
	mixins: [httpMixin],
	watch: {
		'$route' (to, from) {
			this.current = {};
			const url = this.URL_EXPLORER + (this.$route.params.id ? this.$route.params.id : '');
			this.get(url, {}, response => this.container = response.data);
		}
	},
    data: function() {
		return {
			container: null,
			current: {}
		}
    },
	methods: {
		select: function (currentFile) {
			if (this.current == currentFile) {
				this.current = {};
			}
			else {
				this.current = currentFile;
				if (this.current.isFolder) {
					this.$router.push({ name: 'explorer', params: { id: this.current._id }})
				}
			}
		},
		onSyncSubtitle: function (isOffset, millis) {
			const subtitle = {_id: this.current._id, offset: (isOffset ? millis : null), init: (!isOffset ? millis : null)};
			this.patch(this.URL_SUBTITLE, subtitle, response => this.$refs.info.showMessage("Synchronization successful"));
		},
		onSearchSubtitle: function (modified) {
			this.$router.push({ name: 'subtitle', params: { id: this.current._id }, query: { original: this.current.name, modified: modified }})
		},
		getIcon: function (file) {
			if (file.isFolder)
				return "fa-folder-open";
			if (file.isSubtitle)
				return "fa-file-alt";
			return "fa-film";
		}
	},
	mounted() {
		const url = this.URL_EXPLORER + (this.$route.params.id ? this.$route.params.id : '');
		this.get(url, {}, response => this.container = response.data);
	}	
}
/*******************************************************************************************************************/
const SubtitleComponent = {
	template: `
<div>
	<wait ref="wait" />
	<info ref="info" />
	
	<h6>{{ $route.query.original }}</h6>
	<br/>

	<div v-if="container">
		<div v-if="container.resultados.length">
		
			<div class="input-group mb-4">
				<input type="text" class="form-control" placeholder="Filter text" v-model="filterText">
			</div>
		
			<div v-for="subtitle in filteredSubtitles" class="row align-items-center" @click="current = (current == subtitle ? {} : current = subtitle)">
				<div class="col">
					<span class="list-group-item list-group-item-secondary hand">{{ subtitle.details }}</span>
				</div>
				<div v-if="current == subtitle" class="col-auto">
					<div class="btn btn-dark" @click="download(subtitle)">
						<i class="fas fa-lg fa-download" />
					</div>
				</div>
			</div>
		</div>
		<div v-else>
			<h6>No results found</h6>
		</div>
	</div>
</div>
	`,
	components: {
		'wait': WaitComponent,
		'info': InfoComponent,
	},
	mixins: [httpMixin],
    data: function() {
		return {
			container: null,
			filterText: '',
			current: {}
		}
    },
	computed:
	{
		filteredSubtitles: function() {
			return this.container.resultados.filter(
				subtitle => subtitle.details.toLowerCase().includes(this.filterText.toLowerCase()));
		}
	},
	methods: {
		download: function (subtitle) {
			const body = {_id: this.$route.params.id, link: subtitle._id};
			this.put(this.URL_SUBTITLE, body, response => this.$refs.info.showMessage("Download completed successful"));
		}
	},
	mounted() {
		const queryString = { name: this.$route.query.modified };
		this.get(this.URL_SUBTITLE + this.$route.params.id, queryString, response => this.container = response.data);
	}
}
/*******************************************************************************************************************/
const routes = [
  { path: '/', name: 'default', component: ExplorerComponent },
  { path: '/explorer/:id', name: 'explorer', component: ExplorerComponent },
  { path: '/subtitle/:id', name: 'subtitle', component: SubtitleComponent },
  { path: '*', redirect: '/' }
]
const router = new VueRouter({routes});
const app = new Vue({router}).$mount('#app');