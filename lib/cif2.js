(function(){

	/**
	 *  Common Const
	 */
	var DEBUG_MSG = "Произошла ошибка. Смотрите отладочную консоль";
	
	var WIDGET    = "widget";
	var BLOCK     = "block";
	var FILTER    = "filter";

	/**
	 *  System
	 */
	var System = {
		
		get: function( path ){
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open( "GET", path, false );
			
			try{
				xmlHttp.send(null);
			} catch( e ) {
				this.error( "User message: XMLHttpRequest send failed! "+e.message );
			}
			
			var xml = xmlHttp.responseXML;
			if ( xml === null ){
				this.error( "Response IS NULL!" );
			}
			
			return xml.documentElement;
		},
		
		first: function( obj ){
			for ( var key in obj ){
				return key;
			}
		},
		
		inArray: function( a, arr ){
			for ( var i = 0, n = arr.length; i < n; i++ ){
				if ( arr[i] === a )
					return true;
			}
			return false;
		},
		
		addUnique: function( a, arr ){
			if ( !this.inArray( a, arr ) ){
				arr.push( a );
			}
		},
		
		removeUnique: function( a, arr ){
			for ( var i = 0, n = arr.length; i < n; i++ ){
				if ( arr[i] === a ){
					arr.splice( i, 1 );
				}
			}
		},
		
		cut: function( keys, obj ){
			var clipped_obj = {};
			for ( var key in obj ){
				if ( Object.prototype.hasOwnProperty.call( obj, key ) ){
					if ( this.inArray( key, keys ) ){
						clipped_obj[ key ] = obj[ key ];
					}
				}
			}
			return clipped_obj;
		},
		
		error: function( msg ){
			alert( DEBUG_MSG );
			throw new Error( msg );
		}
		
	};
	
	//TODO: Удалить после отладки
	SYSTEM = System;

	/**
	 *  Filter
	 */
	(function(){
	
		var filter = function( description ){
		
			this.description = description;
		
		};
		
		filter.prototype={
		
			getName: function(){
				return this.description.getAttribute("name");
			},
			
			getParams: function(){
				var description = this.description;
				var _params = {};
			
				var paramList = description.getElementsByTagName("param");
				for ( var i = 0, n = paramList.length; i < n; i++ ){
					var param = paramList[i];
					_params[ param.getAttribute("name") ] = {
						full: param.getAttribute("fullParam"),
						values: []
					};
				}
				
				return _params;
			}
		
		};
		
		Filter = filter;
	
	})();

	/**
	 *  Block
	 */
	(function(){
	
		var block = function( description ){
		
			this.description = description;
		
		};
		
		block.prototype = {
		
			getName: function(){
				return this.description.getAttribute( "name" );
			},
			
			issetFilter: function(){

				var childElements = this.description.children;
				
				for ( var i = 0, n = childElements.length; i < n; i++ ){
					var child = childElements[i];
					if ( child.tagName === FILTER ){
						return true;
					}
				}
				
				return false;
			},
			
			getFilter: function(){
				if ( !this.issetFilter() ){
					return false;
				}
				
				return this.description.getElementsByTagName("filter")[0];
			}
		
		};
		
		Block = block;
	
	})();
	
	/**
	 *  Widget extends Container
	 */
	(function(){
	
		var widget = function( description ){
		
			Block.call( this, description );
		
		};
		
		widget.prototype = Object.create( Block.prototype );
		
		widget.prototype.getDataSource = function(){
			return this.description.getAttribute("dataSource");
		};
		
		widget.prototype.getParams = function(){
			var description = this.description;
			var _params = [];
		
			var data = description.getElementsByTagName("data")[0];
			if ( typeof data === "undefined" ){
				System.error("No data widget!");
			}
			
			var paramList = data.getElementsByTagName("param");
			if ( typeof paramList === "undefined" ){
				System.error("No param widget!");
			}
			
			for ( var i = 0, n = paramList.length; i < n; i++ ){
				var param = paramList[i];
				_params.push( param.getAttribute("name") );
			}
			
			return _params;
		};
		
		widget.prototype.constructor = widget;
		
		Widget = widget;
	
	})();
	
	/**
	 *  Main
	 */
	(function(){
	
		var process = function( b ){

			var issetFilter = false,
				filter = null;
			
			if ( b.issetFilter() ){
				var _f = new Filter( b.getFilter() );
				this.filters[ _f.getName() ] = {
					refer: b.getName(),
					params: _f.getParams()
				};
				
				issetFilter = true;
				filter = _f.getName();
			}
			
			this.blocks[ b.getName() ] = {
				"issetFilter": issetFilter,
				"filter": filter
			};
			
			var description = b.description;
			
			this.encapsulation[ b.getName() ] = [];

			for ( var i = 0, n = description.childElementCount; i < n; i++ ){
				var e = description.children[i];
				
				switch( e.tagName ){
				
				case WIDGET:
					var _w = new Widget( e );
					this.encapsulation[ b.getName() ].push( _w.getName() );
					this.widgets[ _w.getName() ] = {
						source: _w.getDataSource(),
						params: _w.getParams(),
						filterMap: {},
						filter:null,
						issetFilter: _w.issetFilter()
					};
					
					if ( _w.issetFilter() ){
						var _f = new Filter( _w.getFilter() );
						this.filters[ _f.getName() ] = {
							refer: _w.getName(),
							params: _f.getParams()
						};
						this.widgets[ _w.getName() ].filter = _f.getName();
					}
					break;
					
				case BLOCK:
					var _b = new Block( e );
					this.encapsulation[ b.getName() ].push( _b.getName() );
					process.call( this, _b );
					break;
					
				default:
					;
					
				}
			}

		};
		
		var writeFilter = function( w, name, param, value ){
			if ( typeof this.widgets[ w ].filterMap[ param ] === "undefined" ) {
				this.widgets[ w ].filterMap[ param ] = {
					instance: name,
					values: [ value ]
				};
			}
			else {
				if ( this.widgets[ w ].filterMap[ param ].instance === name ) {
					this.widgets[ w ].filterMap[ param ].values.push( value );
				}
				else {
					this.widgets[ w ].filterMap[ param ] = {
						instance: name,
						values: [ value ]
					};
				}
			}
		};
		
		var filterRun = function( block, name, param, value ){
			//Если применяется фильтр к виджету и в нем есть данный параметр, то применяем его и не паримся
			if ( typeof this.widgets[ block ] !== "undefined"
			  && System.inArray( param, this.widgets[ block ].params ) ){
				
				writeFilter.apply( this, [ block, name, param, value ] );
				
				console.log("Widget " + block + " update...");
				
				console.log( JSON.stringify( this.widgets[ block ].filterMap ) );
				
				return;
			}
			
			var innerBlocks = this.encapsulation[ block ];

			for ( var i = 0, n = innerBlocks.length; i < n; i++ ){

				var b = innerBlocks[i];
				
				//b - Widget
				if ( typeof this.widgets[ b ] !== "undefined" ){
					//Есть ли у виджета этот параметр вообще в данных
					//У виджета задан локальный фильтр и он применен - не обновляем виджет
					//В противном случае - обновляем
					if ( System.inArray( param, this.widgets[ b ].params ) ){
						if ( this.widgets[ b ].issetFilter
						  && typeof this.filters[ this.widgets[b].filter ].params[ param ] !== "undefined"
						  && this.filters[ this.widgets[b].filter ].params[ param ].values.length > 0 )
							;
						else {
							writeFilter.apply( this, [ b, name, param, value ] );
							
							console.log("Widget " + b + " update...");
							
							console.log( JSON.stringify( this.widgets[ b ].filterMap ) );
						}
					}
				}
				//b - Block
				else {
					if ( this.blocks[ b ].issetFilter
					  && typeof this.filters[ this.blocks[b].filter ].params[ param ] !== "undefined"
					  && this.filters[ this.blocks[ b ].filter ].params[ param ].values.length > 0 )
						;
					else {
						filterRun.apply( this, [ b, name, param, value ] );
					}
				}
				
			}

		};
	
		var cif = function(path){
			var description = System.get( path );
			
			this.encapsulation = {};
			this.blocks = {};
			this.widgets = {};
			this.filters = {};
			
			var b = new Block( description );
			process.call( this, b );
		};
		
		cif.prototype = {
		
			setFilter: function( name, param, value ){
				var refer = this.filters[ name ].refer;

				System.addUnique( value, this.filters[ name ].params[ param ].values );

				filterRun.apply( this, [ refer, name, param, value ] );
				
				return this;
			},
			
			unsetFilter: function( name, param, value ){
				System.removeUnique( value, this.filters[ name ].params[ param ].values );
				
				/**Если фильтр снят полностью обновляем блок с самого корня
				 * иначе обновляем с текущего узла блока
				 */
				if ( this.filters[ name ].params[ param ].values.length > 0 ) {
					var block = this.filters[ name ].refer;
				}
				else {
					var block = System.first( this.encapsulation );
				}
				
				filterRun.apply( this, [ block, name, param, value ] );
				
				return this;
			}
		
		};
		
		Cif = cif;
	
	})();

})();