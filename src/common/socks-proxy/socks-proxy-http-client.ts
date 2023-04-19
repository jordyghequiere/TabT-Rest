import { HttpClient, IExOptions, IHeaders } from 'soap';
import * as req from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocksProxyHttpClient extends HttpClient {

  private _axios: req.Axios;

  constructor(
    private readonly configService: ConfigService,
  ) {
    super({ returnFault: false });

    this._axios = new req.Axios({ httpsAgent: this.createHttpsAgent() });
  }

  createHttpsAgent(): SocksProxyAgent {
    const proxyHost = this.configService.get('SOCKS_PROXY_HOST');
    const proxyPort = this.configService.get('SOCKS_PROXY_PORT');
    const proxyOptions = `socks5://${proxyHost}:${proxyPort}`;
    return new SocksProxyAgent(proxyOptions);
  }

  async request(rurl: string, data: any, callback: (error: any, res?: any, body?: any) => any, exheaders?: IHeaders, exoptions?: IExOptions, caller?: any): Promise<any> {
    const req = this.buildRequest(rurl, data, exheaders, exoptions);
    try {
      const response = await this._axios.request(req);
      //const data = this.handleResponse(response)
      callback(null, response, response.data);
    } catch (e) {
      callback(e);

    }

  }

}
