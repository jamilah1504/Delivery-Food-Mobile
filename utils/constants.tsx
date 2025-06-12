class constants {
    //static BASEURL = 'https://difest.himatikom-polsub.id';
    static BASEURL = 'http://127.0.0.1:8000';
  
    static GETIMAGE(path: string) {
      return `${this.BASEURL}/${path}`;
    }
    static API(path: string) {
        return `${this.BASEURL}/api/${path}`;
      }
  }
  
  export default constants;
  