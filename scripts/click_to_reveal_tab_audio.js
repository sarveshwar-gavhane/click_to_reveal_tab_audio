var userdefinedpaused = false;
var globalisPlaying = true;
var videRef;
define([], function() {

    function ClickRevealTemplate() {
        this.tabsArray = [];
        this.mediaelemantFlag = false;
        this.container;
        this.xml;
    }

    ClickRevealTemplate.prototype = new Util();
    ClickRevealTemplate.prototype.constructor = ClickRevealTemplate;

    ClickRevealTemplate.prototype.init = function(xmlName) {
        var ref = this;

        ref.container = this.getPageContainer();
        $(ref.container).find(".clickToRevealTabBackBtn").click(function() {
            $(ref.container).hide();
            $('.fixed_block').show();
            $('#shellContainer_content_box').removeClass('changingPadding');
            $(ref.container).find('#tab_content').find('#scrolltabcontent').find('#audio_ctr, #audio_ctr_html5').attr('src', '');
        });

        $(ref.container).find('#tab_content').find('#scrolltabcontent').find('#audio_ctr, #audio_ctr_html5').attr('src', '');
        $.ajax({
            type: "GET",
            url: "data/" + xmlName + ".xml",
            dataType: "xml",
            success: function(xml) {
                ref.xml = xml
                ref.addTranscriptResources();
                ref.createCTRtabs();
                ref.loadSlider();
            }
        });
    }

    ClickRevealTemplate.prototype.addTranscriptResources = function() {
        if ($(this.xml).find('transcript').length > 0) {
            var transcriptText = $(this.xml).find('transcript').text();
            $('#contentTab_2').html(transcriptText)
        }
        if ($(this.xml).find('resources').length > 0) {
            var resourcesText = $(this.xml).find('resources').text();
            $('#contentTab_1').html(resourcesText)
        }
    }

    ClickRevealTemplate.prototype.createCTRtabs = function() {
        var thumbLength = $(this.xml).find("thumb_content").length;
        var visitedImage = $(this.xml).find('imageVisited').text();
        var str = '';

        str += '<div class="owl-carousel">';
        for (var i = 0; i < thumbLength; i++) {
            str += '<div class="item tab-width" id="carousal_' + i + '">';
            str += '<img class="CTRAvisitedImage" src="' + visitedImage + '"/>';
            str += '<h3>' + $(this.xml).find('thumb_content').eq(i).find('thumbText').text() + '</h3></div>';
        }
        str += '</div>'

        $(this.container).find('.clickToReveal_tab_audio').find('.crouselContainer').html(str);
        $('.tab-width').addClass($(this.xml).find("widthClass").text());
    }

    ClickRevealTemplate.prototype.addMediaElement = function() {

        $(this.container).find('#audio_ctr').mediaelementplayer({
            features: ['playpause'],
            success: function(mediaElement, domObject) {
                videRef = mediaElement;
                mediaElement.addEventListener('ended', function(e) {
                    $('.mejs__button').removeClass('mejs__replay')
                })
            }
        });
    }

    ClickRevealTemplate.prototype.stopMedia = function() {
        this.play = videRef.paused;
        videRef.pause();
    }

    ClickRevealTemplate.prototype.playMedia = function() {
        if (!this.play) {
            videRef.play();
        }
    }

    ClickRevealTemplate.prototype.loadSlider = function() {
        var instructionHead = $(this.xml).find('instruction').find('head_content').text();
        var instructionParagraph = $(this.xml).find('instruction').find('para_content').text();

        $(this.container).find('.scrolltabcontent-instruction').html(instructionHead);
        $(this.container).find('.scrolltabcontent-instruction').append(instructionParagraph);

        $(this.container).find('.crouselContainer').find('.item').on('click', this.loadContent.bind(this));
        $('.close-icon').on('click', this.closeContent);
    }

    ClickRevealTemplate.prototype.closeContent = function() {
        $('.item').removeClass('selected');
        $('#scrolltabcontent, .close-icon').hide();
        $('.scrolltabcontent-instruction').show();
        videRef.pause();
    }

    ClickRevealTemplate.prototype.addAudio = function(id) {
        var tabAudio = $(this.xml).find('tabs').eq(id).find('CTRaudio').text();
        var $container = $(this.container).find('#tab_content').find('#scrolltabcontent');
        if (!tabAudio) {
            $(this.container).find('.ctr_audioContainer').hide();
            return;
        }

        $container.find('.ctr_audioContainer').show();
        $container.find('#audio_ctr').attr('src', tabAudio);
        $container.find('#audio_ctr_html5').attr('src', tabAudio);
        var CtrTab_Audio = document.getElementById('audio_ctr');
        CtrTab_Audio.play();

        if (this.mediaelemantFlag == false) {
            this.addMediaElement();
            this.mediaelemantFlag = true;
        }
    }

    ClickRevealTemplate.prototype.addContent = function(id) {
        var tabs = $(this.xml).find('tabs');
        var tabSrc = tabs.eq(id).find('imgSrc').text();
        var tabHeading = tabs.eq(id).find('headerContent').text();
        var tabParagraph = tabs.eq(id).find('paragraphContent').text();
        var $container = $(this.container).find('#tab_content').find('#scrolltabcontent');

        $container.find('#tabcontentHeading').html(tabHeading);
        $container.find('#tabParagraph').html(tabParagraph);
        $container.find('#tab-image').attr('src', tabSrc)
    }

    ClickRevealTemplate.prototype.checkCompletion = function(event) {
        if ($(this.container).find('.owl-carousel').find('.item').length == $(this.container).find('.tabSelected').length) {
            window.shell.updateVisitedPages(globalCurTopic, globalCurPage);
        }
    }

    ClickRevealTemplate.prototype.loadContent = function(event) {
        var contentID = $(event.currentTarget).attr('id').split('_')[1];
        videRef.pause();

        if (!contentID) return;
        $(this.container).find('.scrolltabcontent-instruction').hide()
        $(this.container).find('#scrolltabcontent, .close-icon').show();
        $(event.currentTarget).addClass('tabSelected selected');

        this.addContent(contentID)
        this.addAudio(contentID);
        this.checkCompletion();
    }
    return ClickRevealTemplate;
});
