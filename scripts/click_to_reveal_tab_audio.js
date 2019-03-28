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
                    str +='<img class="CTRAvisitedImage" src="'+visitedImage+'"/>';
                    str += '<h3>' + $(ref.xml).find('thumb_content').eq(i).find('thumbText').text() + '</h3></div>';
                }
                str += '</div>'

                $(ref.container).find('.clickToReveal_tab_audio').find('.crouselContainer').html(str);
                ref.loadSlider();
                $('.click_to_reveal_audio_item').addClass($(xml).find("widthClass").text());
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
                autoplay: false,
                features: ['playpause'],

                success: function(mediaElement, domObject) {
                    globalisPlaying = false;
                    userdefinedpaused = true;
                    videRef = mediaElement;

                    mediaElement.addEventListener('ended', function(e) {
                        $('.mejs__button').removeClass('mejs__replay')
                    })

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
            $(this.container).find('#tab_content').show();
            $(this.container).find('#video_Container').hide();
            $(this.container).find('.crouselContainer').find('.item').on('click', this.loadContent.bind(this));
            $('.close-icon').on('click', this.closeContent);
            $(this.container).find('.scrolltabcontent-instruction').html(instructionHead);
            $(this.container).find('.scrolltabcontent-instruction').append(instructionParagraph);
        }

        ClickRevealTemplate.prototype.closeContent = function() {
        	var CtrTab_Audio = document.getElementById('audio_ctr');
            $('.item').removeClass('selected');
            $('.scrolltabcontent-instruction').css('display', 'block');
            $('#scrolltabcontent').css('display', 'none');
            CtrTab_Audio.pause();
        }

        ClickRevealTemplate.prototype.loadContent = function() {
            var contentID = $(event.currentTarget).attr('id').split('_')[1];
            var tabHeading = $(this.xml).find('tabs').eq(contentID).find('headerContent').text();
            var tabParagraph = $(this.xml).find('tabs').eq(contentID).find('paragraphContent').text();
            var audioCtrTab = $(this.xml).find('tabs').eq(contentID).find('CTRaudio').text();
            var tabSrc = $(this.xml).find('tabs').eq(contentID).find('imgSrc').text();

            $('.scrolltabcontent-instruction').css('display', 'none');
            $('#scrolltabcontent').css('display', 'block');
            $(event.currentTarget).addClass('tabSelected selected');
            $(event.currentTarget).find('.CTRAvisitedImage').css('display', 'block');
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('.ctr_audioContainer').show();
            var CtrTab_Audio = document.getElementById('audio_ctr');
           
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('#tabcontentHeading').html(tabHeading);
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('#tabParagraph').html(tabParagraph);
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('#tab-image').attr('src', tabSrc)
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('#audio_ctr').attr('src', audioCtrTab);
            $(this.container).find('#tab_content').find('#scrolltabcontent').find('#audio_ctr_html5').attr('src', audioCtrTab);
            CtrTab_Audio.play();

            if (this.mediaelemantFlag == false) {
                this.addMediaElement();
                this.mediaelemantFlag = true;
            }

            $(this.container).find('.tabs-container').find('#scrolltabcontent').find('#tabParagraph').scrollTop(0);
            if ($(this.container).find('.owl-carousel').find('.item').length == $(this.container).find('.tabSelected').length) {
                window.shell.updateVisitedPages(globalCurTopic, globalCurPage);
            }
            $('.mejs__button').removeClass('mejs__replay');
        }
  
    return ClickRevealTemplate;
});
