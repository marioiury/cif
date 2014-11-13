CIF - компонент иерархической фильтрации

Блок описывается в формате XML.

В будущем HTML вёрстка блока тоже будет генерироваться из XML.

Установка
===

Распакуйте архив в папку вашего веб-сервера

Использование (в будущем)
===

```
var block = new Cif( "block.xml" );
$( "#main" ).appendCif( block );

<div id="main"></div>
```

Использование (сейчас в консольном режиме)
===

```
var block = new Cif( "block.xml" );
/*Установка фильтра*/
//В фильтре filter1 включаем фильтрацию по параметру param1 по ключу 3
block.setFilter( "filter1", "param1", 3 );
block.setFilter( "filter1", "param1", 4 );
/*Сброс фильтра*/
block.unsetFilter( "filter1", "param1", 3 );
```

Коротко о главном что такое фильтр, параметр и ключ.
Предположим есть виджет с картой на которой расставлены маркеры учебных заведений. Виджет имеет фильтр (name=mapF) со следующими параметрами:
	-тип учебного заведения (name=type_edu);
	-административный округ (name=fed_reg);
Существуют следующие типы учебных заведений:
	-Общеобразовательная школа (key=0)
	-Музыкальная школа (key=1)
	-Колледж (key=2)
	-Институт (key=3)
Административные округа:
	-ЦФО (key=0)
	-СЗФО (key=1)
	и т.д.

Тогда:
```
block.setFilter( "mapF", "type_edu", 0 )
	 .setFilter( "mapF", "fed_reg", 0 );
```
Обновит виджет отобразив на нем только расположение общеобразовательных школ центрального федерального округа.

Формат описания блока
===
Описание блока
```
<block name="blockName">
	<!-- содержимое блока -->
</block>
```

Аттрибуты:
	name - имя блока
	orientation - ориентация блока (horizontal/vertical). Вложенные в блок элементы расположены горизонтально/вертикально.
	weight - ширина в процентах относительно родителя. Если родительский компонент горизонтальный, то height = 100% width = weight %, если вертикальный то width = 100% height = weight %

Внутри блока могут быть другие блоки, виджеты, описание фильтра.

Описание виджета
===
```
<widget name="widgetName">
	<!--  -->
	<data>
		<paramList>
			<param name="param1"/>
			<!-- ... -->
			<param name="paramN"/>
		</paramList>
	</data>
</widget>
```

Аттрибуты:
	name - имя блока
	weight - ширина в процентах относительно родителя. Если родительский компонент горизонтальный, то height = 100% width = weight %, если вертикальный то width = 100% height = weight %

Блок data
	Содержит paramList - перечень параметров по которым прогружаются данные в виджет

Описание фильтра
===
```
<filter name="filterName">
	<paramList>
		<param name="param1"/>
		<!-- ... -->
		<param name="paramN"/>
	</paramList>
</filter>
```

