var s,
  BuzzContributions = {
    //settings for global comments
    settings: {
      paging: 3, //# of pages loaded at a time this can be changed to whatever paging you want
      articleTitle: $(document).find('title').text(),
      articleLink: window.location.origin + window.location.pathname,
      contribID: $('#contributions-list').attr('data-contrib-id'),
      contribList: $('#contributions-list'),
      loadBtn: $('#load-contrib-button')
    },

    init: function() {
      s = this.settings;
      t = this.timeIntervals;
      this.loadContrib(0, false);
      this.bindUIActions();
      this.addToolFunctions();
    },

    //set seconds, minutes, hours, weeks, months, years
    timeIntervals: {
      currentDate: new Date(),
      posted: function(time, s) {
        if (s) {
          time += 's';
        } else {
          time = 'a ' + time;
        }
        return 'about ' + time + ' ago';
      },
      second: function(timediff) {
        var s = 1000;
        if (timediff) {
          return Math.floor(timediff / s);
        } else {
          return s;
        }
      },
      minute: function(timediff) {
        var m = this.second() * 60;
        if (timediff) {
          return Math.floor(timediff / m);
        } else {
          return m;
        }
      },
      hour: function(timediff) {
        var h = this.minute() * 60;
        if (timediff) {
          return Math.floor(timediff / h);
        } else {
          return h;
        }
      },
      day: function(timediff) {
        var d = this.hour() * 24;
        if (timediff) {
          return Math.floor(timediff / d);
        } else {
          return d;
        }
      },
      week: function(timediff) {
        var w = this.day() * 7;
        if (timediff) {
          return Math.floor(timediff / w);
        } else {
          return w;
        }
      },
      month: function(date) {
        var currentMonth = (this.currentDate.getFullYear() * 12) + this.currentDate.getMonth();
        return currentMonth - ((date.getFullYear() * 12) + date.getMonth());
      },
      year: function(date) {
        return this.currentDate().getFullYear() - date.getFullYear();
      }
    },


    //get time difference for seconds, minutes hours, weeks, years
    getTimeDiff: function(timediff, date) {
      var s = false;
      if (t.second(timediff) < 60) {
        return t.posted(t.second(timediff) + 'seconds');
      } else if (t.minute(timediff) < 60) {
        return t.posted(t.minute(timediff) + 'minutes');
      } else if (t.hour(timediff) < 60) {
        if (t.hour(timediff) > 1) {
          s = true;
        }
        return t.posted(t.hour(timediff) + ' hour', s) + ' hour';
      } else if (t.week(timediff) < 4) {
        if (t.week(timediff) > 1) {
          s = true;
        }
        return t.posted(t.week(timediff) + ' week', s);
      } else if (t.day(timediff) < 30) {
        if (t.day(timediff) > 1) {
          s = true;
        }
        return t.posted(t.day(timediff) + ' day', s) + ' day';
      } else if (t.month(date) < 12) {
        if (t.month(date) > 1) {
          s = true;
        }
        return t.posted(t.month(date) + ' month', s);
      } else if (t.year(date) > 0) {
        if (t.year(date) > 1) {
          s = true;
        }
        return t.posted(t.year(date) + ' year', s);
      } else {
        return t.posted('some time', s);
      }
    },

    loadContrib: function(page, click) {
      var o = this;
      var contribData = {
        id: s.contribID,
        pageNum: page,
        total: s.paging
      };
      s.loadBtn.button('loading');
      var contribRequest = $.ajax({
        type: 'POST',
        url: 'load-comments.php',
        dataType: 'json',
        data: contribData,
        success: function(data) {
          $.each(data, function(key, value) {
            var comments = value.comments;

            if (!value.paging.next) {
              s.loadBtn.hide();
            }
            $.each(comments, function(i, val) {
              o.addContrib(val);
            });
            s.contribList.append('<li class="page-end" data-page="' + key + '"></li>');
          });
        }
      }).done(function() {
        s.loadBtn.removeAttr('disabled');
        s.loadBtn.button('reset');
        if (window.location.hash && !click) {
          var scrollTo = $(document).find(window.location.hash);
          o.scrollToArticle(scrollTo, 'slow');
        }
      });
    },

    bindUIActions: function() {
      var o = this;
      $(s.loadBtn).on('click', function() {
        s.loadBtn.attr('disabled', 'disabled');
        var page = $('.page-end').last().attr('data-page');
        page = parseInt(page);
        o.loadContrib(page, true);
      });
    },

    addContrib: function(value) {
      var o = this;
      var comment = {
        id: value.id,
        user: 'http://www.buzzfeed.com/' + value.user_info.username,
        name: value.user_info.display_name,
        date: function() {
          return new Date(parseInt(value.added) * 1000);
        },
        timediff: function() {
          return t.currentDate - this.date();
        },
        ago: function() {
          return o.getTimeDiff(this.timediff(), this.date());
        },
        blurb: value.blurb,
        lovehate: function(count) {
          if (count) {
            return count;
          } else {
            return 0;
          }
        }
      };

      //note this markup is really messy - and would want it a lot cleaner, probably in a separate template. But wanted to 
      //have it completed so you could see my styling tactics and the overall idea of how I would implement.
      var contribUser = '<div class="col-md-1"><a href="' + comment.user + '"><img src="assets/images/user.jpg"></a></div>';
      contribUser += '<div class="col-md-11">';
      contribUser += '<a href="http://www.buzzfeed.com/' + comment.user + '" class="user">' + comment.name + '</a>';
      contribUser += '<time datetime="' + comment.date() + '">' + comment.ago() + '</time></div>';

      var subContrib = '<div id="contribuser_' + comment.id + '" class="sub-contrib-container"></div>';

      var tools = '<ul class="tools">';
      tools += '<li class="comments">';
      tools += '<a href="#" class="respond-btn" id="respond-btn' + comment.id + '"><span class="icon"></span><span>RESPOND</span></a>';
      tools += '</li>';
      tools += '<li class="lovehate_btn">';
      tools += '<span class="love icon"></span><span class="count">' + comment.lovehate(value.love_count) + '</span>';
      tools += '<span class="hate icon"></span><span class="count">' + comment.lovehate(value.hate_count) + '</span>';
      tools += '</li>';
      tools += o.getSharing(value);
      tools += '</ul>';
      tools += '<div class="flag"><span class="icon"></span></div>';

      var contrib = '<li><div id="contribuser_' + comment.id + '" class="contrib-container">';
      contrib += '<div class="row user-row">' + contribUser + '</div>';
      contrib += '<div class="row text-row"><div class="col-md-12">' + comment.blurb + '</div></div>';
      contrib += '<div class="row row-tools"><div class="col-md-12">' + tools + '</div></div>';
      contrib += '</div></li>';
      contrib += '<li class="sub-contribution-list" data-parent="contribuser_' + comment.id + '"></li>';
      s.contribList.append(contrib);
    },

    addToolFunctions: function() {
      var o = this;
      var respond = o.getResponding();
      o.getLinkDiv();
      o.appendDiv('respond-btn', respond);
    },

    appendDiv: function(btn, markup) {
      var o = this;
      $(document).on('click', '.' + btn, function() {
        var contribID = $(this).parents('.contrib-container').attr('id');
        var subContainer = $(document).find('[data-parent="' + contribID + '"]');
        subContainer.append(markup);
        o.scrollToArticle(subContainer, 'slow');
      });
    },

    getLinkDiv: function() {
      $(document).on('click', '#getlink-btn', function() {
        var id = $(this).attr('ID');
        var div = $(document).find('[data-openby="' + id + '"]');
        div.removeClass('hidden');
        $('.share').on('hide.bs.dropdown', function() {
          div.addClass('hidden');
        });
        return false;
      });
      $(document).on('click', '.share-this-link', function() {
        return false;
      });
    },

    scrollToArticle: function(scrollTo, speed) {
      $('html, body').animate({
        scrollTop: scrollTo.position().top
      }, speed);
    },

    getResponding: function() {
      //note this markup is really messy - and would want it a lot cleaner, probably in a separate template. But wanted to 
      //have it completed so you could see my styling tactics and the overall idea of how I would implement.
      var markup = '<div id="respondTabs" class="sub-contrib-container">';
      markup += '<ul role="tablist">';
      markup += '<li role="presentation" class="active"><a href="#text" aria-controls="text" role="tab" data-toggle="tab">Text</a></li>';
      markup += '<li role="presentation"><a href="#image" aria-controls="image" role="tab" data-toggle="tab">Image</a></li>';
      markup += '<li role="presentation"><a href="#video" aria-controls="video" role="tab" data-toggle="tab">Video</a></li>';
      markup += '</ul>';
      markup += '<div class="tab-content">';
      markup += '<div role="tabpanel" class="tab-pane active" id="text">';
      markup += '<p>(allowed html tags: &lt;a href=""&gt &lt;b&gt &lt;i&gt &lt;em&gt &lt;strong&gt)</p>';
      markup += '<form><textarea></textarea><div class="form-group form-group-footer"><input type="checkbox"> Share this on Facebook</div><input id="respond-preview" class="btn btn-blue btn-large" type="submit" value="Preview"></form>';
      markup += '</div>';
      markup += '<div role="tabpanel" class="tab-pane" id="image">';
      markup += '<form><div class="form-group"><label>Image</label><input id="upload" class="btn btn-grey btn-large" type="submit" value="Upload an Image.."></div><div class="form-group"><label>Link To <span>(Optional)</span></label><input type="text"></div><div class="form-group"><label>Description <span>(allowed html tags: &lt;a href=""&gt &lt;b&gt &lt;i&gt &lt;em&gt &lt;strong&gt)</span></label><textarea></textarea></div><div class="form-group form-group-footer"><input type="checkbox"> Share this on Facebook</div><input id="respond-preview" class="btn btn-blue btn-large" type="submit" value="Preview"></form>';
      markup += '</div>';
      markup += '<div role="tabpanel" class="tab-pane" id="video">';
      markup += '<form><div class="form-group"><label>URL <span>(YouTube, Vimeo, Soundcloud, Rdio, Spotify, Facebook, Hulu, Google Video, LiveLeak, MetaCafe, DailyMotion, Or MySpace Video)</span></label><input type="text"></div><div class="form-group"><label>Description <span>(allowed html tags: &lt;a href=""&gt &lt;b&gt &lt;i&gt &lt;em&gt &lt;strong&gt)</span></label><textarea></textarea></div><div class="form-group form-group-footer"><input type="checkbox"> Share this on Facebook</div><input id="respond-preview" class="btn btn-blue btn-large" type="submit" value="Preview"></form>';
      markup += '</div>';
      markup += '</div>';
      markup += '</div>';
      return markup;
    },

    getSharing: function(comment) {
      //note this markup is really messy - and would want it a lot cleaner, probably in a separate template. But wanted to 
      //have it completed so you could see my styling tactics and the overall idea of how I would implement.
      var markup = '<li class="share">';
      markup += '<a href="#" class="share-btn" id="share-btn-"' + comment.id + '" data-target="#" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false"><span class="icon share-icon"></span><span>SHARE</span><span class="icon share-arrow"></span></a>';
      // social dropdown
      markup += '<ul class="social-dropdown dropdown-menu" role="menu" aria-labelledby="share-btn-"' + comment.id + '">';
      markup += '<li class="facebook"><a href="#"><span class="icon"></span> Facebook</a></li>';
      markup += '<li class="twitter"><a href="#"><span class="icon"></span> Twitter</a></li>';
      markup += '<li class="email"><a href="mailto:?subject=BuzzFeed: ' + s.articleTitle + '&body=' + comment.blurb + ' ' + s.articleLink + '' + comment.id + '"><span class="icon"></span> Email</a></li>';
      markup += '<li class="getlink">';
      //put together the markup for the link and retrive the comment link
      markup += '<a href="#" id="getlink-btn"><span class="icon"></span> Get Link</a>';
      markup += '<div class="hidden share-this-link" data-openby="getlink-btn">Share Link:';
      markup += '<input type="text" value="' + s.articleLink + '#contribuser_' + comment.id + '"></div>';
      markup += '</li>';
      markup += '</ul>';
      markup += '</li>';
      return markup;
    },
  };

$(document).ready(function() {
  BuzzContributions.init();
});