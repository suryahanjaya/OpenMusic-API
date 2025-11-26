class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlist = await this._playlistsService.getPlaylistById(playlistId);
      const songs = await this._playlistsService.getSongsByPlaylistId(playlistId);

      const content = {
        playlist: {
          ...playlist,
          songs,
        },
      };

      await this._mailSender.sendEmail(targetEmail, JSON.stringify(content));
      // eslint-disable-next-line no-console
      console.log(`Email sent to ${targetEmail}`);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
