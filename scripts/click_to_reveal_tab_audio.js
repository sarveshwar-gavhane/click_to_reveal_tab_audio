var globalisPlaying;
var videoEnded = false;
var userdefinedpaused = false;
var videRef;
define([], function() {

    function ClickRevealTemplate() {
        this.tabsArray = [];
        this.mediaelemantFlag = false;
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
                ref.xml = xml;
                ref.addTranscriptResources();

                var noOfTabs = $(xml).find('tabs').length;
                var thumbLength = $(xml).find("thumb_content").length;
                var visitedImage = $(xml).find('imageVisited').text();
                var str = '';

                for (var i = 0; i < noOfTabs; i++) {
                    ref.tabsArray.push(-1);
                }

                str += '<div class="owl-carousel" id="carouselTab">';
                for (var i = 0; i < thumbLength; i++) {
                    str += '<div class="item click_to_reveal_audio_item" id="carousal_' + i + '">';
                    str += '<img class="CTRAvisitedImage" src="' + visitedImage + '"/>';
                    str += '<h3>' + $(ref.xml).find('thumb_content').eq(i).find('thumbText').text() + '</h3></div>';
                }
                str += '</div>'

                $(ref.container).find('.clickToReveal_tab_audio').find('.crouselContainer').html(str);
                $('.click_to_reveal_audio_item').addClass($(xml).find("widthClass").text());
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

    ClickRevealTemplate.prototype.addMediaElement = function() {

        $(this.container).find('#audio_ctr').mediaelementplayer({
            autoRewind: false,
            features: ['playpause'],
            success: function(mediaElement, domObject) {
                videRef = mediaElement;
                mediaElement.addEventListener('play', function(e) {
                    globalisPlaying = true;
                    videoEnded = false;
                    userdefinedpaused = false;
                })
                mediaElement.addEventListener('pause', function(e) {
                    if (globalisPlaying == true) {
                        userdefinedpaused = true;
                    }
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
        var CtrTab_Audio = document.getElementById('audio_ctr');
        $('.item').removeClass('selected');
        $('#scrolltabcontent, .close-icon').hide();
        $('.scrolltabcontent-instruction').show();
        CtrTab_Audio.pause();
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

        if (!contentID) return;
        $(this.container).find('.scrolltabcontent-instruction').hide()
        $(this.container).find('#scrolltabcontent, .close-icon').show();
        $(event.currentTarget).addClass('tabSelected selected');

        this.addContent(contentID)
        this.addAudio(contentID);
        this.checkCompletion();
        //$('.mejs__button').removeClass('mejs__replay');
    }
    return ClickRevealTemplate;
});
